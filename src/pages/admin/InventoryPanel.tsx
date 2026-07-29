import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { FieldLabel, type InventoryCount, type Notify } from "./adminShared";

export function InventoryPanel({ token, notify }: { token: string | null; notify: Notify }) {
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [selected, setSelected] = useState<InventoryCount | null>(null);
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [filter, setFilter] = useState<string>("");

  async function loadList() {
    const q = filter ? `?status=${filter}` : "";
    const data = await api<InventoryCount[]>(`/admin/inventory/counts${q}`, {}, token);
    setCounts(data);
  }

  async function openCount(id: number) {
    const data = await api<InventoryCount>(`/admin/inventory/counts/${id}`, {}, token);
    setSelected(data);
    setShowLog(false);
    setPassword("");
    setApprovalNote("");
  }

  useEffect(() => {
    void loadList().catch((e) => notify("", e instanceof Error ? e.message : "Erro"));
  }, [token, filter]);

  async function createCount(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await api<InventoryCount>(
        "/admin/inventory/counts",
        { method: "POST", body: JSON.stringify({ note: note || undefined }) },
        token,
      );
      notify("Inventário criado (rascunho)");
      setNote("");
      await loadList();
      setSelected(data);
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  async function saveLines(e: FormEvent) {
    e.preventDefault();
    if (!selected?.lines) return;
    try {
      const data = await api<InventoryCount>(
        `/admin/inventory/counts/${selected.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            lines: selected.lines.map((l) => ({
              product_id: l.product_id,
              counted_qty: Number(l.counted_qty ?? 0),
            })),
          }),
        },
        token,
      );
      notify("Contagem salva");
      setSelected(data);
      await loadList();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  async function submit() {
    if (!selected) return;
    try {
      const data = await api<InventoryCount>(
        `/admin/inventory/counts/${selected.id}/submit`,
        { method: "POST", body: "{}" },
        token,
      );
      notify("Enviado para aprovação");
      setSelected(data);
      await loadList();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  async function approveOrReject(action: "approve" | "reject") {
    if (!selected) return;
    try {
      const data = await api<InventoryCount>(
        `/admin/inventory/counts/${selected.id}/${action}`,
        {
          method: "POST",
          body: JSON.stringify({ password, note: approvalNote || undefined }),
        },
        token,
      );
      notify(action === "approve" ? "Inventário aprovado e estoque ajustado" : "Inventário rejeitado");
      setSelected(data);
      setPassword("");
      await loadList();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro");
    }
  }

  const statusLabel: Record<string, string> = {
    draft: "Rascunho",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };

  return (
    <div className="admin-grid admin-grid--stack">
      <section className="admin-section">
        <h2>Inventário</h2>
        <p className="admin-muted">
          Crie uma contagem, preencha as quantidades, envie para aprovação. A aprovação exige a senha do admin e fica
          registrada (quem e quando).
        </p>
        <form className="admin-form admin-form--compact" onSubmit={createCount}>
          <FieldLabel
            label="Observação"
            tip="Motivo ou local da contagem (ex.: estoque da sala, fechamento mensal). Ajuda no histórico."
          >
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </FieldLabel>
          <button type="submit" className="btn-primary">
            Novo inventário
          </button>
        </form>

        <div className="admin-form__row" style={{ marginTop: "1rem" }}>
          <label className="admin-field">
            <span className="admin-field__label">Filtrar status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </label>
        </div>

        <div className="comparison-table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Itens</th>
                <th>Criado por</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {counts.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{statusLabel[c.status] ?? c.status}</td>
                  <td>{c.lines_count ?? "—"}</td>
                  <td>{c.created_by_name ?? "—"}</td>
                  <td>{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                  <td>
                    <button type="button" className="btn-outline" onClick={() => void openCount(c.id)}>
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="admin-section">
          <h2>
            Contagem #{selected.id}{" "}
            <span className="admin-badge">{statusLabel[selected.status] ?? selected.status}</span>
          </h2>

          {(selected.status === "draft" || selected.status === "rejected") && (
            <form className="admin-form" onSubmit={saveLines}>
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Sistema</th>
                      <th>Contado</th>
                      <th>Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines?.map((l, idx) => {
                      const diff = Number(l.counted_qty ?? 0) - Number(l.system_qty);
                      return (
                        <tr key={l.product_id}>
                          <td>
                            {l.product_code} {l.product_name}
                          </td>
                          <td>{l.system_qty}</td>
                          <td>
                            <input
                              value={l.counted_qty ?? ""}
                              onChange={(e) => {
                                const lines = [...(selected.lines ?? [])];
                                lines[idx] = { ...l, counted_qty: Number(e.target.value) };
                                setSelected({ ...selected, lines });
                              }}
                            />
                          </td>
                          <td>{diff > 0 ? `+${diff}` : diff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="admin-form__actions">
                <button type="submit" className="btn-primary">
                  Salvar contagem
                </button>
                <button type="button" className="btn-outline" onClick={() => void submit()}>
                  Enviar para aprovação
                </button>
              </div>
            </form>
          )}

          {selected.status === "pending" && (
            <div className="admin-form">
              <p className="admin-muted">Confirme com a senha do administrador logado.</p>
              <FieldLabel
                label="Senha"
                tip="Digite a senha do admin logado para confirmar. Quem aprovou e quando fica no log de auditoria."
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </FieldLabel>
              <FieldLabel
                label="Nota da aprovação"
                tip="Comentário do aprovador (ex.: conferido com a prateleira). Aparece no histórico da contagem."
              >
                <input value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} />
              </FieldLabel>
              <div className="admin-form__actions">
                <button type="button" className="btn-primary" onClick={() => void approveOrReject("approve")}>
                  Aprovar e aplicar estoque
                </button>
                <button type="button" className="btn-outline" onClick={() => void approveOrReject("reject")}>
                  Rejeitar
                </button>
              </div>
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Sistema</th>
                      <th>Contado</th>
                      <th>Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines?.map((l) => {
                      const diff = Number(l.counted_qty ?? 0) - Number(l.system_qty);
                      return (
                        <tr key={l.product_id}>
                          <td>
                            {l.product_code} {l.product_name}
                          </td>
                          <td>{l.system_qty}</td>
                          <td>{l.counted_qty}</td>
                          <td>{diff > 0 ? `+${diff}` : diff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selected.status === "approved" && (
            <div>
              <p>
                Aprovado por <strong>{selected.approved_by_name ?? "—"}</strong>
                {selected.approved_at && <> em {new Date(selected.approved_at).toLocaleString("pt-BR")}</>}
              </p>
              {selected.approval_note && <p className="admin-muted">Nota: {selected.approval_note}</p>}
              <button type="button" className="btn-outline" onClick={() => setShowLog((v) => !v)}>
                {showLog ? "Ocultar log" : "Ver quem aprovou e quando"}
              </button>
              {showLog && (
                <div className="comparison-table-wrapper" style={{ marginTop: "0.75rem" }}>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Ação</th>
                        <th>Quem</th>
                        <th>E-mail</th>
                        <th>Quando</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.approvals ?? []).map((a) => (
                        <tr key={a.id}>
                          <td>{a.action === "approved" ? "Aprovado" : "Rejeitado"}</td>
                          <td>{a.actor_name}</td>
                          <td>{a.actor_email}</td>
                          <td>{new Date(a.created_at).toLocaleString("pt-BR")}</td>
                          <td>{a.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
