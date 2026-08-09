import { Link } from "react-router-dom";
import { BrandLockup, HeartRule } from "./BrandMark";
import { SITE } from "../lib/site";

const EXPERIENCE = [
  "Loja que ensina e inspira",
  "Conteúdo educativo de qualidade na plataforma",
  "Produtos selecionados para a prática odontológica",
  "Compra acolhedora, segura e cuidadosa",
];

const FOOTER_LINKS = [
  { to: "/", label: "Início" },
  { to: "/loja", label: "Loja" },
  { to: "/assinar", label: "Assinaturas" },
  { to: "/acesso", label: "Entrar" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo" aria-label="Gabriela Barreto Dental — início">
            <BrandLockup size="lg" />
          </Link>
          <p className="site-footer__lead">Gabriela Barreto Dental</p>
        </div>

        <div className="site-footer__columns">
          <section className="site-footer__experience" aria-labelledby="footer-exp">
            <h2 id="footer-exp" className="site-footer__heading">
              Experiência
            </h2>
            <ul>
              {EXPERIENCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <nav className="site-footer__nav" aria-labelledby="footer-nav">
            <h2 id="footer-nav" className="site-footer__heading">
              Navegação
            </h2>
            <ul>
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <HeartRule className="site-footer__rule" />

      <div className="site-footer__bottom">
        <a
          className="site-footer__whatsapp"
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="site-footer__whatsapp-label">Dúvidas? Fale conosco</span>
          <strong>WhatsApp {SITE.whatsappDisplay}</strong>
        </a>

        <div className="site-footer__meta">
          <p>© {year} Gabriela Barreto Dental</p>
          <p className="site-footer__credit">
            Modelos 3D: University of Dundee, School of Dentistry (CC BY)
          </p>
        </div>
      </div>
    </footer>
  );
}
