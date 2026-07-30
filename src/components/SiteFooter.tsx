import { Link } from "react-router-dom";
import { BrandLockup, HeartRule } from "./BrandMark";

const EXPERIENCE = [
  "Loja que ensina e inspira",
  "Conteúdo educativo de qualidade na nossa plataforma online",
  "Produtos selecionados para apoiar sua saúde bucal",
  "Experiência de compra acolhedora, segura e cuidadosa em cada detalhe",
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo" aria-label="GB Dental — início">
            <BrandLockup size="lg" />
          </Link>
          <p className="site-footer__lead">Ensina, orienta e cuida.</p>
        </div>

        <div className="site-footer__experience">
          <h2 className="site-footer__heading">Experiência</h2>
          <ul>
            {EXPERIENCE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <nav className="site-footer__nav" aria-label="Rodapé">
          <Link to="/loja">Loja</Link>
          <Link to="/assinar">Assinar</Link>
          <Link to="/login">Minha conta</Link>
          <Link to="/perguntas">Perguntas</Link>
        </nav>
      </div>

      <HeartRule className="site-footer__rule" />

      <p className="site-footer__manifesto">
        Ensina. Orienta. Cuida. Conteúdo que educa. Produtos que apoiam. Experiência que acolhe.
      </p>

      <div className="site-footer__meta">
        <p>© {year} GB Dental</p>
        <p className="site-footer__credit">
          Modelos 3D: University of Dundee, School of Dentistry (CC BY)
        </p>
      </div>
    </footer>
  );
}
