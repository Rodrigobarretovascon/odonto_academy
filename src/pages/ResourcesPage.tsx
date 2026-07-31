import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RESOURCES = [
  { title: "Resumos", desc: "Sínteses para revisar temas-chave.", to: "/resumos", needSub: true },
  { title: "Escultura em cera", desc: "28 dentes FDI com fases e vistas.", to: "/app/escultura/13", needSub: true },
  { title: "Anatomia dental", desc: "Atlas interativo da boca e do periodonto.", to: "/app/anatomia", needSub: true },
  { title: "Visualizador 3D", desc: "Modelos para girar, aproximar e estudar.", to: "/app/visualizador-3d", needSub: true },
  { title: "IA", desc: "Tire dúvidas com apoio educacional.", to: "/ia", needSub: true },
  { title: "Perguntas", desc: "Perguntas e respostas por tema.", to: "/perguntas", needSub: true },
  { title: "Loja", desc: "Produtos e planos de acesso.", to: "/loja", needSub: false },
  { title: "Novidades", desc: "Atualizações da plataforma e do conteúdo.", to: "/app/novidades", needSub: true },
];

export function ResourcesPage() {
  const { user, hasAccess } = useAuth();

  return (
    <div className="content-page">
      <h1>Recursos</h1>
      <p className="content-page__lead">
        Conteúdos da plataforma para assinantes — a loja continua aberta a todos.
      </p>
      <div className="feature-grid feature-grid--dense">
        {RESOURCES.map((r) => {
          let to = r.to;
          if (r.needSub && !hasAccess && user?.role !== "admin") {
            to = user ? "/assinar" : "/login";
          }
          return (
            <Link
              key={r.title}
              to={to}
              state={
                to === "/login"
                  ? { from: r.to }
                  : to === "/assinar"
                    ? { needSubscription: true, from: r.to }
                    : undefined
              }
              className="feature-card feature-card--link"
            >
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              {r.needSub && <span className="feature-card__tag">Assinantes</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
