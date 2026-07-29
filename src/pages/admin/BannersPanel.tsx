import { useEffect, useState, type FormEvent } from "react";
import { api, formatPrice } from "../../lib/api";
import { FieldLabel, reaisToCents, type Notify } from "./adminShared";

type ShopCustomer = {
  id: number;
  name: string;
  document: string | null;
  active: boolean;
};

type Banner = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  customer_id: number | null;
  customer_name?: string | null;
  cost_per_impression_cents: number;
  impression_count: number;
  total_cost_cents?: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  sort_order: number;
};

type Impression = {
  id: number;
  cost_cents: number;
  created_at: string;
  customer_name: string | null;
};

type Summary = {
  overall: { impressions: number; totalCents: number; banners: number };
  byCustomer: Array<{
    customerId: number;
    customerName: string;
    customerDocument: string | null;
    impressions: number;
    totalCents: number;
    banners: number;
  }>;
};

const empty = {
  title: "",
  description: "",
  image_url: "",
  link_url: "",
  customer_id: "",
  cost: "",
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: "",
  active: true,
  sort_order: "0",
};

const API = import.meta.env.VITE_API_URL ?? "/api";

export function BannersPanel({ token, notify }: { token: string | null; notify: Notify }) {
  const [list, setList] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<ShopCustomer[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [extractId, setExtractId] = useState<number | null>(null);
  const [impressions, setImpressions] = useState<Impression[]>([]);

  async function load() {
    const [banners, cust, sum] = await Promise.all([
      api<Banner[]>("/admin/banners", {}, token),
      api<ShopCustomer[]>("/admin/shop-customers?all=1", {}, token),
      api<Summary>("/admin/banners/summary", {}, token),
    ]);
    setList(banners);
    setCustomers(cust.filter((c) => c.active !== false));
    setSummary(sum);
  }

  useEffect(() => {
    void load().catch((e) => notify("", e instanceof Error ? e.message : "Erro"));
  }, [token]);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      title: b.title,
      description: b.description ?? "",
      image_url: b.image_url,
      link_url: b.link_url ?? "",
      customer_id: b.customer_id == null ? "" : String(b.customer_id),
      cost: b.cost_per_impression_cents ? String((b.cost_per_impression_cents / 100).toFixed(2)) : "",
      valid_from: String(b.valid_from).slice(0, 10),
      valid_until: b.valid_until ? String(b.valid_until).slice(0, 10) : "",
      active: b.active,
      sort_order: String(b.sort_order ?? 0),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        image_url: form.image_url.trim(),
        link_url: form.link_url.trim() || null,
        customer_id: form.customer_id === "" ? null : Number(form.customer_id),
        cost_per_impression_cents: form.cost ? reaisToCents(form.cost) : 0,
        valid_from: form.valid_from,
        valid_until: form.valid_until || null,
        active: form.active,
        sort_order: Number(form.sort_order || 0),
      };
      if (editingId) {
        await api(`/admin/banners/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        notify("Banner atualizado");
      } else {
        await api("/admin/banners", { method: "POST", body: JSON.stringify(payload) }, token);
        notify("Banner criado");
      }
      resetForm();
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function uploadPhoto(bannerId: number, file: File) {
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch(`${API}/admin/banners/${bannerId}/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Falha no upload");
    notify("Imagem do banner atualizada");
    await load();
  }

  async function openExtract(id: number) {
    setExtractId(id);
    setImpressions(await api<Impression[]>(`/admin/banners/${id}/impressions`, {}, token));
  }

  function downloadExtractPdf(id: number) {
    const base = import.meta.env.VITE_API_URL ?? "/api";
    const url = `${base}/admin/banners/${id}/impressions.pdf`;
    void fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Falha ao gerar PDF");
        }
        return res.blob();
      })
      .then((blob) => {
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `extrato-banner-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(href);
        notify("PDF do extrato baixado");
      })
      .catch((err) => notify("", err instanceof Error ? err.message : "Erro no PDF"));
  }

  async function remove(id: number) {
    if (!confirm("Excluir este banner e seu extrato?")) return;
    await api(`/admin/banners/${id}`, { method: "DELETE" }, token);
    notify("Banner excluído");
    if (extractId === id) setExtractId(null);
    await load();
  }

  return (
    <div className="admin-volume">
      <section className="admin-section admin-volume__form">
        <h2>{editingId ? "Editar banner" : "Novo banner"}</h2>
        <p className="admin-muted">
          Banner rotativo no topo do site. Cliente pagante deve existir em Clientes. Custo cobrado por aparição.
        </p>
        <form className="admin-form" onSubmit={save}>
          <FieldLabel label="Título" tip="Nome interno e texto alternativo do banner.">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </FieldLabel>
          <FieldLabel label="Descrição" tip="Texto curto da campanha (uso interno e acessibilidade).">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FieldLabel>
          <FieldLabel
            label="URL da imagem"
            tip="Caminho da imagem. Obrigatório no cadastro; depois use Foto na lista para enviar arquivo."
          >
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Opcional agora — use Foto na lista depois"
            />
          </FieldLabel>
          <FieldLabel label="Link ao clicar" tip="URL de destino quando o visitante clica no banner. Pode ficar em branco.">
            <input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://..."
            />
          </FieldLabel>
          <FieldLabel
            label="Cliente pagante"
            tip="Anunciante cadastrado em Clientes. Deixe vazio se for banner próprio (sem cobrança a terceiros)."
          >
            <select
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            >
              <option value="">— Sem cliente (próprio) —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.document ? ` · ${c.document}` : ""}
                </option>
              ))}
            </select>
          </FieldLabel>
          <div className="admin-form__row">
            <FieldLabel
              label="Custo por aparição (R$)"
              tip="Valor cobrado do cliente a cada vez que o banner é exibido no site."
            >
              <input value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Ordem" tip="Menor número aparece primeiro no rodízio.">
              <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </FieldLabel>
          </div>
          <div className="admin-form__row">
            <FieldLabel label="Válido de" tip="Primeiro dia em que o banner pode entrar no rodízio.">
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                required
              />
            </FieldLabel>
            <FieldLabel label="Válido até" tip="Último dia de exibição. Em branco = sem data final.">
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              />
            </FieldLabel>
          </div>
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
              {editingId ? "Salvar" : "Cadastrar"}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h2>Banners</h2>
        {summary && (
          <div className="banner-summary">
            <div>
              <span>Aparições (geral)</span>
              <strong>{summary.overall.impressions}</strong>
            </div>
            <div>
              <span>Valor total (geral)</span>
              <strong>{formatPrice(summary.overall.totalCents)}</strong>
            </div>
            <div>
              <span>Banners</span>
              <strong>{summary.overall.banners}</strong>
            </div>
          </div>
        )}

        {summary && summary.byCustomer.length > 0 && (
          <div className="comparison-table-wrapper" style={{ marginBottom: "1rem" }}>
            <h3 className="admin-subtitle">Totais por cliente</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Banners</th>
                  <th>Aparições</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.byCustomer.map((row) => (
                  <tr key={row.customerId}>
                    <td>
                      {row.customerName}
                      {row.customerDocument ? (
                        <span className="admin-muted"> · {row.customerDocument}</span>
                      ) : null}
                    </td>
                    <td>{row.banners}</td>
                    <td>{row.impressions}</td>
                    <td>{formatPrice(row.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Cliente</th>
                <th>Vigência</th>
                <th>Custo/apar.</th>
                <th>Aparições</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="banner-admin-thumb">
                      {b.image_url && <img src={b.image_url} alt="" />}
                      <div>
                        <strong>{b.title}</strong>
                        {b.description && <p className="admin-muted">{b.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td>{b.customer_name || "—"}</td>
                  <td>
                    {String(b.valid_from).slice(0, 10)}
                    {b.valid_until ? ` → ${String(b.valid_until).slice(0, 10)}` : " → ∞"}
                  </td>
                  <td>{formatPrice(b.cost_per_impression_cents)}</td>
                  <td>{b.impression_count}</td>
                  <td>{formatPrice(Number(b.total_cost_cents ?? b.impression_count * b.cost_per_impression_cents))}</td>
                  <td>
                    <span className={`admin-badge${b.active ? " is-on" : ""}`}>
                      {b.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="volume-card__actions">
                      <button type="button" className="btn-outline" onClick={() => startEdit(b)}>
                        Editar
                      </button>
                      <label className="btn-outline admin-upload">
                        Foto
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadPhoto(b.id, file).catch((err) => notify("", err.message));
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button type="button" className="btn-outline" onClick={() => void openExtract(b.id)}>
                        Extrato
                      </button>
                      <button type="button" className="btn-outline" onClick={() => downloadExtractPdf(b.id)}>
                        PDF
                      </button>
                      <button type="button" className="btn-outline" onClick={() => void remove(b.id)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-muted">
                    Nenhum banner cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {extractId != null && (
          <div className="comparison-table-wrapper" style={{ marginTop: "1rem" }}>
            <h3 className="admin-subtitle">
              Extrato de aparições · banner #{extractId}
              <button
                type="button"
                className="btn-outline btn-outline--sm"
                style={{ marginLeft: "0.75rem" }}
                onClick={() => downloadExtractPdf(extractId)}
              >
                Exportar PDF
              </button>
              <button type="button" className="btn-outline btn-outline--sm" style={{ marginLeft: "0.45rem" }} onClick={() => setExtractId(null)}>
                Fechar
              </button>
            </h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Cliente</th>
                  <th>Custo</th>
                </tr>
              </thead>
              <tbody>
                {impressions.map((i) => (
                  <tr key={i.id}>
                    <td>{new Date(i.created_at).toLocaleString("pt-BR")}</td>
                    <td>{i.customer_name || "—"}</td>
                    <td>{formatPrice(i.cost_cents)}</td>
                  </tr>
                ))}
                {impressions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="admin-muted">
                      Nenhuma aparição registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
