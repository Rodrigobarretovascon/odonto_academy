import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RESUMOS } from "../data/resumos";

export function ResumosPage() {
  const { hasAccess, user } = useAuth();
  const canReadFull = hasAccess || user?.role === "admin";
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="content-page">
      <h1>Resumos</h1>
      <p className="content-page__lead">
        {canReadFull
          ? "Resumos completos da sua assinatura."
          : "Prévia gratuita dos resumos. O texto completo exige assinatura."}
      </p>
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
                  {canReadFull ? (
                    <p>{r.body}</p>
                  ) : (
                    <p>
                      {r.body.slice(0, 120)}…{" "}
                      <Link to="/assinar">Assine para ler o resumo completo</Link>
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
