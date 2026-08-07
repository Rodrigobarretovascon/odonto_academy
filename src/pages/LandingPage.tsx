import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { api, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { BrandIcon } from "../components/BrandIcon";
import { BrandLockup } from "../components/BrandMark";
import { SITE } from "../lib/site";

const FEATURES = [
  { title: "Resumos", desc: "Sínteses para revisar com foco.", to: "/resumos", icon: "spark" as const, needSub: true },
  { title: "Escultura em cera", desc: "28 dentes FDI, fases e vistas finais.", to: "/app/escultura/13", icon: "tooth" as const, needSub: true },
  { title: "Anatomia dental", desc: "Atlas vivo da boca e do periodonto.", to: "/app/anatomia", icon: "anatomy" as const, needSub: true },
  { title: "Visualizador 3D", desc: "Gire e estude cada dente em 3D.", to: "/app/visualizador-3d", icon: "spark" as const, needSub: true },
  { title: "IA para tirar dúvidas", desc: "Apoio educacional no chat.", to: "/app/ia", icon: "chat" as const, needSub: true },
  { title: "Perguntas odontológicas", desc: "Perguntas e respostas por tema.", to: "/perguntas", icon: "chat" as const, needSub: true },
  { title: "Loja", desc: "Produtos e planos de acesso.", to: "/loja", icon: "tooth" as const, needSub: false },
  { title: "Novidades", desc: "Atualizações da plataforma.", to: "/app/novidades", icon: "spark" as const, needSub: true },
];

const HOW_BENEFITS = [
  {
    icon: "bag" as const,
    title: "Comprar materiais selecionados",
    text: "Itens cuidadosamente escolhidos para a prática clínica e acadêmica.",
    to: "/loja" as const,
  },
  {
    icon: "study" as const,
    title: "Estudar conteúdos exclusivos",
    text: "Material organizado para revisar e evoluir com método.",
    to: "/acesso" as const,
  },
  {
    icon: "anatomy" as const,
    title: "Anatomia e escultura na prática",
    text: "Aprenda anatomia e escultura dental de forma visual e aplicada.",
    to: "/acesso" as const,
  },
];

function stage(p: number, a: number, b: number) {
  if (b <= a) return p >= b ? 1 : 0;
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const IO_THRESHOLDS = Array.from({ length: 24 }, (_, i) => i / 23);

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { hasAccess, user } = useAuth();
  const landingRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  /* Progresso da abertura + atmosfera global */
  useEffect(() => {
    const track = openingRef.current;
    const landing = landingRef.current;
    if (!track || !landing) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setProgress(0.4);
      track.style.setProperty("--opening-p", "0.4");
      landing.style.setProperty("--story-p", "0.35");
      return;
    }

    let raf = 0;
    const update = () => {
      const openTotal = Math.max(track.offsetHeight - window.innerHeight, 1);
      const openScrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), openTotal);
      const p = openScrolled / openTotal;
      track.style.setProperty("--opening-p", p.toFixed(4));
      setProgress(p);

      const storyTotal = Math.max(landing.scrollHeight - window.innerHeight, 1);
      const storyP = Math.min(1, Math.max(0, window.scrollY / storyTotal));
      landing.style.setProperty("--story-p", storyP.toFixed(4));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Capítulos: revelação contínua pelo quanto estão na viewport */
  useEffect(() => {
    const root = storyRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chapters = root.querySelectorAll<HTMLElement>("[data-chapter]");

    if (reduceMotion) {
      chapters.forEach((el) => el.style.setProperty("--reveal", "1"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const boosted = Math.min(1, Math.max(0.75, entry.intersectionRatio * 2.2));
          (entry.target as HTMLElement).style.setProperty("--reveal", boosted.toFixed(3));
        }
      },
      { threshold: IO_THRESHOLDS, rootMargin: "20% 0px -4% 0px" },
    );

    chapters.forEach((el) => {
      el.style.setProperty("--reveal", "0.85");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  const canAccessMembers = Boolean(hasAccess || user?.role === "admin");

  const featureTo = (f: (typeof FEATURES)[number]) => {
    if (f.needSub && !canAccessMembers) return "/acesso";
    if (f.to.startsWith("/app") && !user) return "/acesso";
    return f.to;
  };

  const featureState = (f: (typeof FEATURES)[number], to: string) => {
    if (to === "/acesso") return { from: f.to };
    return undefined;
  };

  const ctasIn = stage(progress, 0.06, 0.26);
  const exit = stage(progress, 0.48, 1);
  const scrollHint = Math.max(0, 1 - stage(progress, 0.03, 0.18));
  const contentOpacity = Math.max(0, 1 - exit);
  const contentY = exit * -56;
  const ctasOpacity = Math.max(0, ctasIn * (1 - exit));
  const ctasY = (1 - ctasIn) * 20 + exit * -24;
  const ctasInteractive = ctasOpacity > 0.4 && exit < 0.75;
  const stickyFade = Math.max(0, 1 - stage(progress, 0.72, 1) * 0.55);

  return (
    <div ref={landingRef} className="landing">
      <div className="landing__atmosphere" aria-hidden="true" />

      <section ref={openingRef} className="opening" aria-label="Abertura">
        <div className="opening__sticky" style={{ opacity: stickyFade } as CSSProperties}>
          <div className="opening__media" aria-hidden="true">
            <img
              src="/uploads/banners/banner-gb-dental.jpg"
              alt=""
              className="opening__media-img"
            />
          </div>
          <div className="opening__veil" aria-hidden="true" />

          <div
            className="opening__stage"
            style={
              {
                opacity: contentOpacity,
                transform: `translate3d(0, ${contentY}px, 0)`,
              } as CSSProperties
            }
          >
            <div className="opening__brand">
              <BrandLockup size="lg" />
            </div>

            <h1 className="opening__headline">
              <span className="opening__line">
                Seu espaço para <em>aprender</em>,
              </span>
              <span className="opening__line">
                <em>praticar</em> e aperfeiçoar
              </span>
              <span className="opening__line">
                a <em>escultura dental</em>.
              </span>
            </h1>

            <p className="opening__tagline">Ensina · Orienta · Cuida</p>
            <span className="opening__rule" aria-hidden="true" />

            <div
              className="opening__actions"
              style={
                {
                  opacity: ctasOpacity,
                  transform: `translate3d(0, ${ctasY}px, 0)`,
                  pointerEvents: ctasInteractive ? "auto" : "none",
                } as CSSProperties
              }
              aria-hidden={!ctasInteractive}
            >
              <Link
                to={user && hasAccess ? "/app" : "/assinar"}
                className="btn-primary btn-primary--lg"
                tabIndex={ctasInteractive ? undefined : -1}
              >
                {user && hasAccess ? "Ir para minha conta" : "Assinar agora"}
              </Link>
              <Link
                to="/acesso"
                className="btn-outline btn-outline--lg"
                tabIndex={ctasInteractive ? undefined : -1}
              >
                Já sou membro — Fazer login
              </Link>
            </div>
          </div>

          <a
            href="#explore"
            className="opening__scroll"
            aria-label="Continuar para o conteúdo"
            style={{ opacity: scrollHint * contentOpacity } as CSSProperties}
            tabIndex={scrollHint > 0.2 ? undefined : -1}
          >
            <span className="opening__scroll-mouse" aria-hidden="true">
              <span className="opening__scroll-wheel" />
            </span>
            <span className="opening__scroll-label">Role para descobrir</span>
          </a>
        </div>
      </section>

      <div ref={storyRef} className="landing__story">
        <section className="story-chapter story-chapter--how" data-chapter="how" id="como-funciona">
          <div className="story-chapter__inner story-chapter__inner--wide">
            <header className="story-chapter__header story-chapter__header--how">
              <p className="story-chapter__eyebrow">Como funciona</p>
              <h2>Muito mais do que uma loja de materiais odontológicos</h2>
              <p className="story-chapter__lead">
                A GB Dental nasceu para reunir, em um único lugar, tudo o que estudantes e profissionais de
                Odontologia precisam para evoluir.
              </p>
            </header>

            <div className="how-mission">
              <p>
                Aqui você encontra materiais cuidadosamente selecionados para a prática clínica e acadêmica,
                mas nosso propósito vai muito além da venda de produtos.
              </p>
              <p>
                Nossa missão é ensinar, revisar e desenvolver habilidades por meio de conteúdos de qualidade,
                aulas, materiais exclusivos e orientações práticas — tornando o aprendizado mais acessível,
                organizado e eficiente.
              </p>
            </div>

            <p className="how-grid__intro">Na GB Dental você poderá:</p>
            <div className="how-grid">
              {HOW_BENEFITS.map((b, i) => (
                <Link
                  key={b.title}
                  to={b.to}
                  className="how-card how-card--link story-card"
                  style={{ "--card-i": i } as CSSProperties}
                >
                  <BrandIcon name={b.icon} size={26} />
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </Link>
              ))}
            </div>

            <div className="how-cta">
              <Link to="/assinar" className="btn-primary btn-primary--lg">
                Conhecer assinaturas
              </Link>
              <Link to="/#explore" className="btn-outline btn-outline--lg">
                Ver conteúdos
              </Link>
            </div>
          </div>
        </section>

        <section className="story-chapter" data-chapter="explore" id="explore">
          <div className="story-chapter__inner">
            <header className="story-chapter__header">
              <p className="story-chapter__eyebrow">Da descoberta ao estudo</p>
              <h2>Explore a plataforma</h2>
              <p>Cada recurso abre um caminho — toque e transforme sua forma de aprender.</p>
            </header>
            <div className="story-chapter__grid feature-grid feature-grid--dense">
              {FEATURES.map((f, i) => {
                const to = featureTo(f);
                return (
                  <Link
                    key={f.title}
                    to={to}
                    state={featureState(f, to)}
                    className="feature-card feature-card--link story-card"
                    style={{ "--card-i": i } as CSSProperties}
                  >
                    <BrandIcon name={f.icon} />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    {f.needSub && <span className="feature-card__tag">Assinantes</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="story-chapter" data-chapter="shop" id="patrocinadores">
          <div className="story-chapter__inner">
            <header className="story-chapter__header">
              <p className="story-chapter__eyebrow">Loja</p>
              <h2>Patrocinadores e produtos</h2>
              <p>Apoios e itens da loja — visíveis na página inicial.</p>
            </header>
            <div className="story-chapter__grid product-grid">
              {products.map((p, i) => (
                <div key={p.id} className="story-card" style={{ "--card-i": i } as CSSProperties}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <p className="section__note story-chapter__note">
              Imagens ilustrativas · Produtos sujeitos a disponibilidade
            </p>
          </div>
        </section>

        <section className="story-chapter story-chapter--finale" data-chapter="help" id="ajuda">
          <div className="story-chapter__inner">
            <header className="story-chapter__header">
              <p className="story-chapter__eyebrow">Contato</p>
              <h2>Precisa de ajuda?</h2>
              <p>Fale com a gente pelos canais oficiais.</p>
            </header>
            <div className="story-chapter__grid help-links">
              <a
                className="help-links__card story-card"
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--card-i": 0 } as CSSProperties}
              >
                WhatsApp
              </a>
              <a
                className="help-links__card story-card"
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--card-i": 1 } as CSSProperties}
              >
                Instagram
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
