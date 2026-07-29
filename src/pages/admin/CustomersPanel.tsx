import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { FieldLabel, formatDocument, type Notify } from "./adminShared";

type ShopCustomer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  notes: string | null;
  active: boolean;
};

type DocLookup = {
  document: string;
  type: "cpf" | "cnpj";
  valid: boolean;
  source: string;
  name?: string;
  tradeName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customerId?: number;
  message?: string;
  needsManualFill?: boolean;
};

const empty = {
  name: "",
  email: "",
  phone: "",
  document: "",
  notes: "",
  active: true,
};

function digits(v: string) {
  return v.replace(/\D/g, "");
}

export function CustomersPanel({ token, notify }: { token: string | null; notify: Notify }) {
  const [list, setList] = useState<ShopCustomer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [docType, setDocType] = useState<"cpf" | "cnpj">("cpf");
  const [lookupMsg, setLookupMsg] = useState("");
  const [lookupKind, setLookupKind] = useState<"ok" | "info" | "err" | "">("");
  const [q, setQ] = useState("");

  async function load(search = q) {
    const query = search.trim()
      ? `/admin/shop-customers?all=1&q=${encodeURIComponent(search.trim())}`
      : "/admin/shop-customers?all=1";
    setList(await api<ShopCustomer[]>(query, {}, token));
  }

  useEffect(() => {
    void load().catch((e) => notify("", e instanceof Error ? e.message : "Erro"));
  }, [token]);

  function startEdit(c: ShopCustomer) {
    const doc = c.document ?? "";
    setEditingId(c.id);
    setDocType(digits(doc).length > 11 ? "cnpj" : "cpf");
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      document: doc,
      notes: c.notes ?? "",
      active: c.active !== false,
    });
    setLookupMsg("");
    setLookupKind("");
  }

  async function lookupDocument() {
    const expected = docType === "cpf" ? 11 : 14;
    const doc = digits(form.document).slice(0, expected);
    if (doc.length !== expected) {
      notify("", `${docType.toUpperCase()} deve ter ${expected} dígitos`);
      return;
    }
    try {
      const data = await api<DocLookup>(
        "/admin/documents/lookup",
        { method: "POST", body: JSON.stringify({ document: doc, type: docType }) },
        token,
      );
      if (!data.valid) {
        setLookupMsg(data.message ?? "Documento inválido");
        setLookupKind("err");
        notify("", data.message ?? "Documento inválido");
        return;
      }
      if (data.customerId) {
        const local =
          list.find((c) => c.id === data.customerId) ??
          (await api<ShopCustomer[]>(`/admin/shop-customers?document=${doc}&all=1`, {}, token))[0];
        if (local) startEdit(local);
        setLookupMsg("");
        setLookupKind("");
        notify("Cliente encontrado no cadastro");
        return;
      }
      setForm((f) => ({
        ...f,
        document: formatDocument(doc, docType),
        name: data.name || data.tradeName || f.name,
        email: data.email || f.email,
        phone: data.phone || f.phone,
        notes: data.address ? `Endereço RF: ${data.address}` : f.notes,
      }));
      if (data.source === "brasilapi" || data.source === "external") {
        setLookupMsg("");
        setLookupKind("ok");
        notify(docType === "cnpj" ? "CNPJ preenchido pela Receita (BrasilAPI)" : "CPF preenchido pelo provedor");
      } else {
        setLookupKind("info");
        setLookupMsg(docType === "cpf" ? "CPF válido — preencha o nome." : (data.message ?? "Preencha o nome."));
      }
    } catch (err) {
      setLookupKind("err");
      notify("", err instanceof Error ? err.message : "Falha na consulta");
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        document: digits(form.document) || null,
        notes: form.notes || null,
        active: form.active,
      };
      if (editingId) {
        await api(`/admin/shop-customers/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        notify("Cliente atualizado");
      } else {
        await api("/admin/shop-customers", { method: "POST", body: JSON.stringify(payload) }, token);
        notify("Cliente cadastrado");
      }
      setEditingId(null);
      setForm(empty);
      setLookupMsg("");
      setLookupKind("");
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function toggleActive(c: ShopCustomer) {
    try {
      await api(
        `/admin/shop-customers/${c.id}`,
        { method: "PATCH", body: JSON.stringify({ active: !c.active }) },
        token,
      );
      notify(c.active ? "Cliente inativado" : "Cliente ativado");
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="admin-volume">
      <section className="admin-section admin-volume__form">
        <h2>{editingId ? "Editar cliente" : "Novo cliente"}</h2>
        <p className="admin-muted">CNPJ consulta a Receita. CPF valida e busca no cadastro local.</p>
        <form className="admin-form" onSubmit={save}>
          <div className="order-desk__tabs" role="group" aria-label="Tipo de documento">
            <button
              type="button"
              className={docType === "cpf" ? "is-on" : ""}
              onClick={() => {
                setDocType("cpf");
                setForm((f) => ({ ...f, document: formatDocument(f.document, "cpf") }));
                setLookupMsg("");
                setLookupKind("");
              }}
            >
              CPF
            </button>
            <button
              type="button"
              className={docType === "cnpj" ? "is-on" : ""}
              onClick={() => {
                setDocType("cnpj");
                setForm((f) => ({ ...f, document: formatDocument(f.document, "cnpj") }));
                setLookupMsg("");
                setLookupKind("");
              }}
            >
              CNPJ
            </button>
          </div>

          <div className="order-desk__doc-row">
            <FieldLabel
              label={docType === "cpf" ? "CPF" : "CNPJ"}
              tip={
                docType === "cnpj"
                  ? "Busca no cadastro e, se não achar, consulta a Receita Federal (BrasilAPI) para preencher a razão social."
                  : "Valida o CPF e busca no cadastro. Dados de pessoa física não vêm de API pública — digite o nome se for novo."
              }
            >
              <input
                value={form.document}
                onChange={(e) => setForm({ ...form, document: formatDocument(e.target.value, docType) })}
                placeholder={docType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                inputMode="numeric"
              />
            </FieldLabel>
            <button type="button" className="btn-outline" onClick={() => void lookupDocument()}>
              Buscar
            </button>
          </div>
          {lookupMsg && (
            <p className={`doc-lookup-msg doc-lookup-msg--${lookupKind || "info"}`}>{lookupMsg}</p>
          )}

          <FieldLabel
            label={docType === "cnpj" ? "Razão social" : "Nome"}
            tip="Nome completo (PF) ou razão social (PJ) usados nos pedidos e no histórico."
          >
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FieldLabel>
          <div className="admin-form__row">
            <FieldLabel label="E-mail" tip="E-mail principal do cliente. Pode ficar em branco.">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Telefone" tip="Telefone ou WhatsApp para contato. Pode ficar em branco.">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FieldLabel>
          </div>
          <FieldLabel
            label="Observações"
            tip="Endereço, preferências ou outras notas internas sobre o cliente. Não aparecem na loja."
          >
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </FieldLabel>
          <label className="admin-field">
            <span className="admin-field__label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{" "}
              Ativo
            </span>
          </label>
          <div className="admin-form__actions">
            <button type="submit" className="btn-primary">
              {editingId ? "Salvar" : "Adicionar cliente"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                  setLookupMsg("");
                  setLookupKind("");
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-section admin-volume__list">
        <div className="admin-volume__list-head">
          <h2>Clientes</h2>
          <div className="order-desk__doc-row" style={{ margin: 0, maxWidth: "18rem" }}>
            <input
              placeholder="Filtrar…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(q);
              }}
            />
            <button type="button" className="btn-outline" onClick={() => void load(q)}>
              Filtrar
            </button>
          </div>
        </div>

        <div className="volume-cards">
          {list.map((c) => (
            <article key={c.id} className={`volume-card${!c.active ? " is-inactive" : ""}`}>
              <header className="volume-card__header">
                <div className="volume-card__title">
                  <h3>{c.name}</h3>
                  <span className={`admin-badge ${c.active ? "is-on" : "is-off"}`}>
                    {c.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="volume-card__actions">
                  <button type="button" className="btn-outline" onClick={() => startEdit(c)}>
                    Editar
                  </button>
                  <button type="button" className="btn-outline" onClick={() => void toggleActive(c)}>
                    {c.active ? "Inativar" : "Ativar"}
                  </button>
                </div>
              </header>
              <div className="volume-card__meta">
                {c.document && (
                  <span className="volume-card__chip">
                    Doc <strong>{c.document}</strong>
                  </span>
                )}
                {c.phone && (
                  <span className="volume-card__chip">
                    Tel <strong>{c.phone}</strong>
                  </span>
                )}
                {c.email && (
                  <span className="volume-card__chip">
                    E-mail <strong>{c.email}</strong>
                  </span>
                )}
              </div>
              {c.notes && <p className="admin-muted">{c.notes}</p>}
            </article>
          ))}
          {list.length === 0 && <p className="admin-muted">Nenhum cliente cadastrado.</p>}
        </div>
      </section>
    </div>
  );
}
