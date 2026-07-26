export function NewsPage() {
  const items = [
    {
      date: "Jul 2026",
      title: "Visualizador 3D e guia do canino (13)",
      desc: "Novo modelo anatômico Dundee com vistas em alta resolução e rotação interativa.",
    },
    {
      date: "Em breve",
      title: "Todos os 28 dentes em 3D",
      desc: "Modelos Sketchfab sendo integrados conforme disponibilidade.",
    },
    {
      date: "Em breve",
      title: "Vídeos de escultura da oclusal",
      desc: "Passo a passo para sulcos em molares e pré-molares.",
    },
  ];

  return (
    <div className="news-page">
      <header className="page-header">
        <h1>Novidades</h1>
        <p>Conteúdos novos enviados pela Gabriela Barreto</p>
      </header>
      <ul className="news-list">
        {items.map((item) => (
          <li key={item.title} className="news-item">
            <time>{item.date}</time>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
