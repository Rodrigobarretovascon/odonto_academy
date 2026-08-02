import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageShell } from "../components/PageShell";

const RESOURCES = [
  { title: "Resumos", desc: "Sínteses para revisar temas-chave.", to: "/resumos", needSub: true },
  { title: "Escultura em cera", desc: "28 dentes FDI com fases e vistas.", to: "/app/escultura/13", needSub: true },
  { title: "Anatomia dental", desc: "Atlas interativo da boca e do periodonto.", to: "/app/anatomia", needSub: true },
  { title: "Visualizador 3D", desc: "Modelos para girar, aproximar e estudar.", to: "/app/visualizador-3d", needSub: true },
  { title: "IA", desc: "Tire dúvidas com apoio educacional.", to: "/app/ia", needSub: true },
  { title: "Perguntas", desc: "Perguntas e respostas por tema.", to: "/perguntas", needSub: true },
  { title: "Loja", desc: "Produtos e planos de acesso.", to: "/loja", needSub: false },
  { title: "Novidades", desc: "Atualizações da plataforma e do conteúdo.", to: "/app/novidades", needSub: true },
];

export function ResourcesPage() {
  const { user, hasAccess } = useAuth();
  const canAccess = Boolean(hasAccess || user?.role === "admin");

  return (
    <PageShell
      eyebrow="GB Dental · Plataforma"
      title="Recursos"
      lead="Conteúdos da plataforma para assinantes — a loja continua aberta a todos."
      actions={
        !canAccess ? (
          <>
            <Link to="/acesso" className="btn-primary btn-primary--lg">
              Entrar na minha conta
            </Link>
            <Link to="/assinar" className="btn-outline btn-outline--lg">
              Quero assinar
            </Link>
          </>
        ) : (
          <Link to="/app" className="btn-primary btn-primary--lg">
            Ir para minha conta
          </Link>
        )
      }
    >
      <div className="feature-grid feature-grid--dense page-panel__grid">
        {RESOURCES.map((r) => {
          const to = r.needSub && !canAccess ? "/acesso" : r.to;
          return (
            <Link
              key={r.title}
              to={to}
              state={to === "/acesso" ? { from: r.to } : undefined}
              className="feature-card feature-card--link"
            >
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              {r.needSub && <span className="feature-card__tag">Assinantes</span>}
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
