import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RESOURCES = [
  { title: "Resumos", desc: "Sínteses para revisar temas-chave.", to: "/resumos", needAuth: false },
  { title: "Escultura em cera", desc: "28 dentes FDI com fases e vistas.", to: "/app/escultura/13", needSub: true },
  { title: "Anatomia dental", desc: "Atlas interativo da boca e do periodonto.", to: "/app/anatomia", needSub: true },
  { title: "Visualizador 3D", desc: "Modelos para girar, aproximar e estudar.", to: "/app/visualizador-3d", needSub: true },
  { title: "IA", desc: "Tire dúvidas com apoio educacional.", to: "/ia", needAuth: true },
  { title: "Perguntas", desc: "Perguntas e respostas por tema.", to: "/perguntas", needAuth: false },
  { title: "Loja", desc: "Produtos e planos de acesso.", to: "/loja", needAuth: false },
  { title: "Novidades", desc: "Atualizações da plataforma e do conteúdo.", to: "/app/novidades", needSub: true },
];

export function ResourcesPage() {
  const { user, hasAccess } = useAuth();

  return (
    <div className="content-page">
      <h1>Recursos</h1>
      <p className="content-page__lead">Tudo o que a plataforma oferece — gratuito e para assinantes.</p>
      <div className="feature-grid feature-grid--dense">
        {RESOURCES.map((r) => {
          let to = r.to;
          if (r.needSub && !hasAccess && user?.role !== "admin") to = "/assinar";
          else if (r.needAuth && !user) to = "/login";
          return (
            <Link key={r.title} to={to} state={to === "/login" ? { from: r.to } : undefined} className="feature-card feature-card--link">
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
