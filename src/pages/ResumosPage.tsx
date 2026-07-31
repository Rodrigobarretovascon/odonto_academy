import { useState } from "react";
import { RESUMOS } from "../data/resumos";

export function ResumosPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="content-page">
      <h1>Resumos</h1>
      <p className="content-page__lead">Resumos completos da sua assinatura.</p>
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
    </div>
  );
}
