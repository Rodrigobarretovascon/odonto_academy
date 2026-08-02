import { useState } from "react";
import { RESUMOS } from "../data/resumos";
import { PageShell } from "../components/PageShell";

export function ResumosPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <PageShell
      eyebrow="GB Dental · Assinantes"
      title="Resumos"
      lead="Resumos completos da sua assinatura para revisar com clareza."
    >
      <div className="resumo-grid">
        {RESUMOS.map((r) => {
          const open = openId === r.id;
          return (
            <article key={r.id} className="resumo-card">
              <span className="resumo-card__topic">{r.topic}</span>
              <h2>{r.title}</h2>
              <p>{r.preview}</p>
              <button type="button" className="btn-outline" onClick={() => setOpenId(open ? null : r.id)}>
                {open ? "Fechar" : "Ler mais"}
              </button>
              {open && (
                <div className="resumo-card__body">
                  <p>{r.body}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
