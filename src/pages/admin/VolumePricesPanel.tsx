import { useEffect, useState, type FormEvent } from "react";
import { api, formatPrice } from "../../lib/api";
import {
  FieldLabel,
  reaisToCents,
  type AdminProductLite,
  type Notify,
  type VolumeSchedule,
} from "./adminShared";

type TierDraft = { min_qty: string; max_qty: string; unit_price: string };

const emptyTier = (): TierDraft => ({ min_qty: "3", max_qty: "", unit_price: "" });

export function VolumePricesPanel({
  token,
  products,
  notify,
}: {
  token: string | null;
  products: AdminProductLite[];
  notify: Notify;
}) {
  const [list, setList] = useState<VolumeSchedule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    product_id: "",
    name: "Tabela volume",
    valid_from: new Date().toISOString().slice(0, 10),
    valid_until: "",
    active: true,
    tiers: [emptyTier()] as TierDraft[],
  });

  async function load() {
    const data = await api<VolumeSchedule[]>("/admin/volume-prices", {}, token);
    setList(data);
  }

  useEffect(() => {
    void load().catch((e) => notify("", e instanceof Error ? e.message : "Erro"));
  }, [token]);

  function startEdit(s: VolumeSchedule) {
    setEditingId(s.id);
    setForm({
      product_id: String(s.product_id),
      name: s.name,
      valid_from: String(s.valid_from).slice(0, 10),
      valid_until: s.valid_until ? String(s.valid_until).slice(0, 10) : "",
      active: s.active,
      tiers: s.tiers.map((t) => ({
        min_qty: String(t.min_qty),
        max_qty: t.max_qty == null ? "" : String(t.max_qty),
        unit_price: String((t.unit_price_cents / 100).toFixed(2)),
      })),
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        product_id: Number(form.product_id),
        name: form.name,
        valid_from: form.valid_from,
        valid_until: form.valid_until || null,
        active: form.active,
        tiers: form.tiers
          .filter((t) => t.min_qty && t.unit_price)
          .map((t) => ({
            min_qty: Number(t.min_qty),
            max_qty: t.max_qty === "" ? null : Number(t.max_qty),
            unit_price_cents: reaisToCents(t.unit_price),
          })),
      };
      if (editingId) {
        await api(`/admin/volume-prices/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        notify("Tabela de volume atualizada");
      } else {
        await api("/admin/volume-prices", { method: "POST", body: JSON.stringify(payload) }, token);
        notify("Tabela de volume cadastrada");
      }
      setEditingId(null);
      setForm({
        product_id: "",
        name: "Tabela volume",
        valid_from: new Date().toISOString().slice(0, 10),
        valid_until: "",
        active: true,
        tiers: [emptyTier()],
      });
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function toggleActive(s: VolumeSchedule) {
    try {
      await api(
        `/admin/volume-prices/${s.id}`,
        { method: "PATCH", body: JSON.stringify({ active: !s.active }) },
        token,
      );
      notify(s.active ? "Tabela desativada" : "Tabela ativada");
      await load();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  function formatDate(value: string) {
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return d.toLocaleDateString("pt-BR");
  }

  function tierLabel(t: VolumeSchedule["tiers"][number]) {
    if (t.max_qty != null) return `${t.min_qty} a ${t.max_qty} un.`;
    return `a partir de ${t.min_qty} un.`;
  }

  return (
    <div className="admin-volume">
      <section className="admin-section admin-volume__form">
        <h2>{editingId ? "Editar preço por volume" : "Cadastrar preço por volume"}</h2>
        <p className="admin-muted">
          Escolha o produto, defina faixas de quantidade com preço unitário, período de validade e status.
        </p>
        <form className="admin-form" onSubmit={save}>
          <FieldLabel
            label="Produto"
            tip="Produto da loja que receberá preços diferentes conforme a quantidade comprada."
          >
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              required
              disabled={!!editingId}
            >
              <option value="">Selecione</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel
            label="Nome da tabela"
            tip="Nome interno para identificar esta tabela (ex.: Atacado 2026, Promo feira)."
          >
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FieldLabel>
          <div className="admin-form__row">
            <FieldLabel label="Válido de" tip="Primeiro dia em que estas faixas de preço passam a valer nos pedidos.">
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                required
              />
            </FieldLabel>
            <FieldLabel
              label="Válido até"
              tip="Último dia de vigência. Deixe em branco se a tabela não tiver data de término."
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
              Ativa
            </span>
          </label>

          <h3 className="admin-subtitle">Faixas</h3>
          {form.tiers.map((t, idx) => (
            <div key={idx} className="admin-form__row admin-tier-row">
              <FieldLabel
                label="Qtd mín."
                tip="Quantidade mínima de unidades nesta faixa para o preço unitário abaixo valer."
              >
                <input
                  value={t.min_qty}
                  onChange={(e) => {
                    const tiers = [...form.tiers];
                    tiers[idx] = { ...t, min_qty: e.target.value };
                    setForm({ ...form, tiers });
                  }}
                  required
                />
              </FieldLabel>
              <FieldLabel
                label="Qtd máx."
                tip="Quantidade máxima desta faixa. Deixe em branco se a faixa for aberta (sem teto)."
              >
                <input
                  value={t.max_qty}
                  onChange={(e) => {
                    const tiers = [...form.tiers];
                    tiers[idx] = { ...t, max_qty: e.target.value };
                    setForm({ ...form, tiers });
                  }}
                />
              </FieldLabel>
              <FieldLabel
                label="Preço un. (R$)"
                tip="Preço por unidade cobrado quando a quantidade do item estiver nesta faixa."
              >
                <input
                  value={t.unit_price}
                  onChange={(e) => {
                    const tiers = [...form.tiers];
                    tiers[idx] = { ...t, unit_price: e.target.value };
                    setForm({ ...form, tiers });
                  }}
                  required
                />
              </FieldLabel>
              {form.tiers.length > 1 && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setForm({ ...form, tiers: form.tiers.filter((_, i) => i !== idx) })}
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-outline"
            onClick={() => setForm({ ...form, tiers: [...form.tiers, emptyTier()] })}
          >
            + Faixa
          </button>
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
                  setForm({
                    product_id: "",
                    name: "Tabela volume",
                    valid_from: new Date().toISOString().slice(0, 10),
                    valid_until: "",
                    active: true,
                    tiers: [emptyTier()],
                  });
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
          <h2>Tabelas cadastradas</h2>
          <p className="admin-muted">{list.length} tabela{list.length === 1 ? "" : "s"}</p>
        </div>

        {list.length === 0 ? (
          <p className="admin-muted">Nenhuma tabela de volume ainda. Cadastre a primeira ao lado.</p>
        ) : (
          <div className="volume-cards">
            {list.map((s) => (
              <article key={s.id} className={`volume-card${!s.active ? " is-inactive" : ""}`}>
                <header className="volume-card__header">
                  <div className="volume-card__title">
                    <h3>{s.name}</h3>
                    <span className={`admin-badge ${s.active ? "is-on" : "is-off"}`}>
                      {s.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <div className="volume-card__actions">
                    <button type="button" className="btn-outline" onClick={() => startEdit(s)}>
                      Editar
                    </button>
                    <button type="button" className="btn-outline" onClick={() => void toggleActive(s)}>
                      {s.active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </header>

                <div className="volume-card__product">
                  <span className="admin-code">{s.product_code}</span>
                  <span className="volume-card__product-name">{s.product_name}</span>
                </div>

                <div className="volume-card__meta">
                  <span className="volume-card__chip">
                    Início <strong>{formatDate(s.valid_from)}</strong>
                  </span>
                  <span className="volume-card__chip">
                    Fim <strong>{s.valid_until ? formatDate(s.valid_until) : "Indeterminado"}</strong>
                  </span>
                  <span className="volume-card__chip">
                    Faixas <strong>{s.tiers.length}</strong>
                  </span>
                </div>

                <table className="volume-card__tiers">
                  <thead>
                    <tr>
                      <th>Faixa</th>
                      <th>Preço unitário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.tiers.map((t, i) => (
                      <tr key={i}>
                        <td>{tierLabel(t)}</td>
                        <td>{formatPrice(t.unit_price_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
