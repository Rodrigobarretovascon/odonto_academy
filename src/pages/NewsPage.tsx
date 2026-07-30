import { Link } from "react-router-dom";
import { NEWS_CATEGORY_LABEL, NEWS_ITEMS } from "../data/news";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function NewsPage() {
  const items = [...NEWS_ITEMS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="news-page">
      <header className="page-header">
        <h1>Novidades</h1>
        <p>Conteúdos, vídeos, modelos 3D e atualizações do GB Dental.</p>
      </header>

      <ul className="news-list">
        {items.map((item) => (
          <li key={item.id} className="news-item">
            <div className="news-item__meta">
              <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
              <span className="news-item__cat">{NEWS_CATEGORY_LABEL[item.category]}</span>
            </div>
            <h2>
              {item.href ? <Link to={item.href}>{item.title}</Link> : item.title}
            </h2>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
      <p className="content-page__note">
        Para publicar novas entradas sem alterar esta página, acrescente itens em{" "}
        <code>src/data/news.ts</code> (ou na API futura de novidades).
      </p>
    </div>
  );
}
