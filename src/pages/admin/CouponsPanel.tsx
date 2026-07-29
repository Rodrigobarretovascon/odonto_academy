import { useEffect, useState, type FormEvent } from "react";
import { api, formatPrice } from "../../lib/api";
import { FieldLabel, reaisToCents, type Notify } from "./adminShared";

type Coupon = {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  min_order_cents: number;
};

const empty = {
  code: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  max_uses: "",
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: "",
  active: true,
  min_order: "",
};

export function CouponsPanel({ token, notify }: { token: string | null; notify: Notify }) {
  const [list, setList] = useState<Coupon[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    setList(await api<Coupon[]>("/admin/coupons", {}, token));
  }

  useEffect(() => {
    void load().catch((e) => notify("", e instanceof Error ? e.message : "Erro"));
  }, [token]);

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description ?? "",
      discount_type: c.discount_type,
      discount_value:
        c.discount_type === "fixed"
          ? String((c.discount_value / 100).toFixed(2))
          : String(c.discount_value),
      max_uses: c.max_uses == null ? "" : String(c.max_uses),
      valid_from: String(c.valid_from).slice(0, 10),
      valid_until: c.valid_until ? String(c.valid_until).slice(0, 10) : "",
      active: c.active,
      min_order: c.min_order_cents ? String((c.min_order_cents / 100).toFixed(2)) : "",
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value:
          form.discount_type === "fixed" ? reaisToCents(form.discount_value) : Number(form.discount_value),
        max_uses: form.max_uses === "" ? null : Number(form.max_uses),
        valid_from: form.valid_from,
        valid_until: form.valid_until || null,
        active: form.active,
        min_order_cents: form.min_order ? reaisToCents(form.min_order) : 0,
      };
      if (editingId) {
        await api(`/admin/coupons/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        notify("Cupom atualizado");
      } else {
        await api("/admin/coupons", { method: "POST", body: JSON.stringify(payload) }, token);
        notify("Cupom cadastrado");
      }
      setEditingId(null);
      setForm(empty);
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro ao salvar cupom");
    }
  }

  return (
    <div className="admin-volume">
      <section className="admin-section admin-volume__form">
        <h2>{editingId ? "Editar cupom" : "Novo cupom"}</h2>
        <p className="admin-muted">Código, desconto, limite de usos e validade. O pedido valida antes de aplicar.</p>
        <form className="admin-form" onSubmit={save}>
          <FieldLabel
            label="Código"
            tip="Texto que o cliente digita no pedido (ex.: BEMVINDA10). Deve ser único e sem espaços."
          >
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
            />
          </FieldLabel>
          <FieldLabel
            label="Descrição"
            tip="Nome interno da campanha para você identificar o cupom na lista (o cliente não vê isso)."
          >
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FieldLabel>
          <div className="admin-form__row">
            <FieldLabel
              label="Tipo"
              tip="Percentual reduz % do subtotal; valor fixo abate um valor em reais do pedido."
            >
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })
                }
              >
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </FieldLabel>
            <FieldLabel
              label={form.discount_type === "percent" ? "Desconto (%)" : "Desconto (R$)"}
              tip={
                form.discount_type === "percent"
                  ? "Percentual de desconto sobre o subtotal (ex.: 10 = 10%)."
                  : "Valor em reais abatido do subtotal (ex.: 50,00)."
              }
            >
              <input
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                required
              />
            </FieldLabel>
          </div>
          <div className="admin-form__row">
            <FieldLabel
              label="Máx. usos"
              tip="Quantas vezes o cupom pode ser usado no total. Deixe vazio para usos ilimitados; cada pedido válido conta 1."
            >
              <input value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            </FieldLabel>
            <FieldLabel
              label="Pedido mínimo (R$)"
              tip="Subtotal mínimo do pedido para o cupom ser aceito. Use 0 se não houver mínimo."
            >
              <input value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
            </FieldLabel>
          </div>
          <div className="admin-form__row">
            <FieldLabel label="Válido de" tip="Primeiro dia em que o cupom pode ser aplicado nos pedidos.">
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                required
              />
            </FieldLabel>
            <FieldLabel
              label="Válido até"
              tip="Último dia de uso. Deixe em branco se o cupom não tiver data de expiração."
            >
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
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
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
          <h2>Cupons</h2>
          <p className="admin-muted">{list.length}</p>
        </div>
        <div className="volume-cards">
          {list.map((c) => {
            const remaining = c.max_uses == null ? null : Math.max(0, c.max_uses - c.used_count);
            return (
              <article key={c.id} className={`volume-card${!c.active ? " is-inactive" : ""}`}>
                <header className="volume-card__header">
                  <div className="volume-card__title">
                    <h3>{c.code}</h3>
                    <span className={`admin-badge ${c.active ? "is-on" : "is-off"}`}>
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="volume-card__actions">
                    <button type="button" className="btn-outline" onClick={() => startEdit(c)}>
                      Editar
                    </button>
                  </div>
                </header>
                {c.description && <p className="admin-muted">{c.description}</p>}
                <div className="volume-card__meta">
                  <span className="volume-card__chip">
                    Desconto{" "}
                    <strong>
                      {c.discount_type === "percent"
                        ? `${c.discount_value}%`
                        : formatPrice(c.discount_value)}
                    </strong>
                  </span>
                  <span className="volume-card__chip">
                    Usos <strong>{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}</strong>
                  </span>
                  {remaining != null && (
                    <span className="volume-card__chip">
                      Restam <strong>{remaining}</strong>
                    </span>
                  )}
                  <span className="volume-card__chip">
                    Vigência{" "}
                    <strong>
                      {String(c.valid_from).slice(0, 10)}
                      {c.valid_until ? ` → ${String(c.valid_until).slice(0, 10)}` : " → ∞"}
                    </strong>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
