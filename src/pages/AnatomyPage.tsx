import { Link } from "react-router-dom";
import { toothNavItems } from "../data/tooth-registry";

const SECTIONS = [
  {
    title: "Arcada dentária",
    content:
      "A dentição permanente possui 32 dentes (excluímos terceiros molares neste guia: 28 dentes). Dividem-se em incisivos, caninos, pré-molares e molares, com morfologia adaptada à função.",
  },
  {
    title: "Nomenclatura das faces",
    content:
      "Vestibular (externa), palatina/lingual (interna), mesial (linha média), distal (afastamento) e incisal/oclusal (mastigação). Cada face possui características específicas por grupo dentário.",
  },
  {
    title: "A face oclusal",
    content:
      "Nos molares e pré-molares, a oclusal apresenta cúspides, sulcos e fossas. Os sulcos são esculpidos com instrumento fino, respeitando profundidade e inclinação das paredes. A oclusal deve ser estudada antes da escultura em cera.",
  },
  {
    title: "Linha cervical",
    content:
      "Marca a transição coroa-raiz. Na escultura em cera, a linha cervical orienta proporções e delimita o bloco inicial.",
  },
];

export function AnatomyPage() {
  return (
    <div className="anatomy-page">
      <header className="page-header">
        <h1>Anatomia Dental</h1>
        <p>Fundamentos para escultura e identificação morfológica</p>
      </header>
      <div className="anatomy-grid">
        {SECTIONS.map((s) => (
          <article key={s.title} className="anatomy-card">
            <h2>{s.title}</h2>
            <p>{s.content}</p>
          </article>
        ))}
      </div>
      <section className="anatomy-teeth">
        <h2>Estude por dente</h2>
        <p>Selecione um dente para ver faces, oclusal e visualizador 3D no guia de escultura.</p>
        <div className="anatomy-teeth__grid">
          {toothNavItems.slice(0, 8).map((t) => (
            <Link key={t.key} to={`/app/escultura/${t.key}`} className="anatomy-tooth-link">
              <strong>{t.shortName}</strong>
              <span>{t.fullName}</span>
            </Link>
          ))}
        </div>
        <Link to="/app/escultura" className="btn-outline">
          Ver todos os 28 dentes →
        </Link>
      </section>
    </div>
  );
}
