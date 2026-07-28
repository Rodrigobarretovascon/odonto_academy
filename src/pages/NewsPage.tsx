import { Link } from "react-router-dom";
import { contentSlides } from "../data/content-manifest";

export function NewsPage() {
  const featured = contentSlides.slice(0, 3);

  const items = [
    ...(contentSlides.length > 0
      ? [
          {
            date: "Jul 2026",
            title: "Atlas anatômico na Academia",
            desc: "A anatomia deixou de ser galeria de slides: jornadas visuais com hotspots, cinema oclusal e imersão.",
            link: "/app/anatomia",
          },
        ]
      : []),
    {
      date: "Jul 2026",
      title: "Visualizador 3D e guia do canino (13)",
      desc: "Modelo anatômico Dundee com textura original, vistas em alta resolução e rotação interativa.",
    },
    {
      date: "Em breve",
      title: "Todos os 28 dentes em 3D",
      desc: "Modelos Sketchfab sendo integrados conforme disponibilidade.",
    },
  ];

  return (
    <div className="news-page">
      <header className="page-header">
        <h1>Novidades</h1>
        <p>Conteúdos novos enviados pela Gabriela Barreto</p>
      </header>

      {featured.length > 0 && (
        <section className="news-featured" aria-label="Entrada do atlas">
          <h2>Entrar no atlas</h2>
          <div className="news-featured__grid">
            {featured.map((slide) => (
              <Link key={slide.id} to="/app/anatomia" className="news-featured__card">
                <img src={slide.image} alt={slide.title} loading="lazy" />
                <span>{slide.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ul className="news-list">
        {items.map((item) => (
          <li key={item.title} className="news-item">
            <time>{item.date}</time>
            <h2>
              {"link" in item && item.link ? (
                <Link to={item.link}>{item.title}</Link>
              ) : (
                item.title
              )}
            </h2>
            <p>{item.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
