import { onlyDigits } from "./pricing.js";

export type DocumentLookupResult = {
  document: string;
  type: "cpf" | "cnpj";
  valid: boolean;
  source: "local" | "brasilapi" | "external" | "none";
  name?: string;
  tradeName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string | null;
  message?: string;
  needsManualFill?: boolean;
};

function isValidCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

function isValidCnpj(cnpj: string) {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string, factors: number[]) => {
    const sum = factors.reduce((acc, f, i) => acc + Number(base[i]) * f, 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

async function lookupCnpjBrasilApi(cnpj: string): Promise<DocumentLookupResult | null> {
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    razao_social?: string;
    nome_fantasia?: string;
    email?: string | null;
    ddd_telefone_1?: string | null;
    descricao_situacao_cadastral?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  };
  const phone = data.ddd_telefone_1
    ? `(${String(data.ddd_telefone_1).slice(0, 2)}) ${String(data.ddd_telefone_1).slice(2)}`
    : null;
  const addressParts = [
    data.logradouro,
    data.numero,
    data.bairro,
    data.municipio && data.uf ? `${data.municipio}/${data.uf}` : data.municipio,
    data.cep,
  ].filter(Boolean);
  return {
    document: cnpj,
    type: "cnpj",
    valid: true,
    source: "brasilapi",
    name: data.razao_social || data.nome_fantasia || undefined,
    tradeName: data.nome_fantasia || undefined,
    email: data.email ?? null,
    phone,
    address: addressParts.length ? addressParts.join(", ") : null,
    status: data.descricao_situacao_cadastral ?? null,
    message: "Dados obtidos via BrasilAPI (Receita Federal).",
  };
}

/** Optional paid CPF provider: CPF_LOOKUP_URL with {cpf} and header CPF_LOOKUP_TOKEN */
async function lookupCpfExternal(cpf: string): Promise<DocumentLookupResult | null> {
  const base = process.env.CPF_LOOKUP_URL;
  if (!base) return null;
  const url = base.includes("{cpf}") ? base.replace("{cpf}", cpf) : `${base.replace(/\/$/, "")}/${cpf}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.CPF_LOOKUP_TOKEN) {
    headers.Authorization = `Bearer ${process.env.CPF_LOOKUP_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  const payload = (data.data as Record<string, unknown> | undefined) ?? data;
  const name = String(payload.NOME ?? payload.nome ?? payload.name ?? "").trim();
  if (!name) return null;
  return {
    document: cpf,
    type: "cpf",
    valid: true,
    source: "external",
    name,
    email: (payload.email as string) ?? null,
    phone: (payload.telefone as string) ?? (payload.phone as string) ?? null,
    message: "Dados obtidos via provedor de CPF configurado.",
  };
}

export async function lookupPublicDocument(
  raw: string,
  preferredType?: "cpf" | "cnpj",
): Promise<DocumentLookupResult> {
  let document = onlyDigits(raw);
  const type: "cpf" | "cnpj" =
    preferredType ?? (document.length > 11 ? "cnpj" : "cpf");

  if (type === "cpf") {
    document = document.slice(0, 11);
    const valid = isValidCpf(document);
    if (document.length !== 11 || !valid) {
      return {
        document,
        type: "cpf",
        valid: false,
        source: "none",
        message:
          document.length !== 11
            ? "CPF deve ter 11 dígitos."
            : "CPF inválido (dígitos verificadores).",
      };
    }
    const external = await lookupCpfExternal(document).catch(() => null);
    if (external) return external;
    return {
      document,
      type: "cpf",
      valid: true,
      source: "none",
      needsManualFill: true,
      message: "CPF válido — preencha o nome.",
    };
  }

  document = document.slice(0, 14);
  const valid = isValidCnpj(document);
  if (document.length !== 14 || !valid) {
    return {
      document,
      type: "cnpj",
      valid: false,
      source: "none",
      message:
        document.length !== 14
          ? "CNPJ deve ter 14 dígitos."
          : "CNPJ inválido (dígitos verificadores).",
    };
  }
  const remote = await lookupCnpjBrasilApi(document).catch(() => null);
  if (remote) return remote;
  return {
    document,
    type: "cnpj",
    valid: true,
    source: "none",
    needsManualFill: true,
    message: "CNPJ válido, mas a consulta pública não retornou dados no momento.",
  };
}
