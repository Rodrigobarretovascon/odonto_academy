import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";

type Props = {
  label: string;
  display: ReactNode;
  value: string;
  onSave: (next: string) => Promise<void> | void;
  type?: "text" | "textarea" | "number" | "select";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
};

/** Valor visível + botão ao lado para editar e salvar no lugar. */
export function InlineEditRow({
  label,
  display,
  value,
  onSave,
  type = "text",
  options,
  placeholder,
  multiline,
  readOnly,
}: Props) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await onSave(draft);
      setEditing(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setDraft(value);
    setErr("");
    setEditing(false);
  }

  return (
    <div className={`inline-edit${editing ? " is-editing" : ""}${readOnly ? " is-readonly" : ""}`}>
      <div className="inline-edit__label">{label}</div>
      <div className="inline-edit__body">
        {editing ? (
          <div className="inline-edit__editor">
            {type === "select" && options ? (
              <select
                id={id}
                ref={inputRef as Ref<HTMLSelectElement>}
                value={draft}
                disabled={busy}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancel();
                }}
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : multiline || type === "textarea" ? (
              <textarea
                id={id}
                ref={inputRef as Ref<HTMLTextAreaElement>}
                value={draft}
                disabled={busy}
                rows={3}
                placeholder={placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancel();
                }}
              />
            ) : (
              <input
                id={id}
                ref={inputRef as Ref<HTMLInputElement>}
                type="text"
                inputMode={type === "number" ? "decimal" : undefined}
                value={draft}
                disabled={busy}
                placeholder={placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancel();
                  if (e.key === "Enter") void commit();
                }}
              />
            )}
            <div className="inline-edit__actions">
              <button type="button" className="btn-primary btn-outline--sm" disabled={busy} onClick={() => void commit()}>
                Salvar
              </button>
              <button type="button" className="btn-outline btn-outline--sm" disabled={busy} onClick={cancel}>
                Cancelar
              </button>
            </div>
            {err && <p className="inline-edit__error">{err}</p>}
          </div>
        ) : (
          <div className="inline-edit__view">
            <div className="inline-edit__value">{display}</div>
            {!readOnly && (
              <button
                type="button"
                className="inline-edit__btn"
                aria-label={`Editar ${label}`}
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
