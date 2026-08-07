import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { api, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/BrandMark";
import { ProductImageCarousel, productImageSlides } from "../components/ProductImageCarousel";
import { SITE } from "../lib/site";

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

  const salesItems = useMemo(() => {
    const base = products;
    if (base.length === 0) return [];
    const copies = base.length < 4 ? 3 : 2;
    return Array.from({ length: copies }, () => base).flat();
  }, [products]);

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

  const contentOpacity = 1 - stage(progress, 0.55, 0.92) * 0.35;
  const contentY = stage(progress, 0.4, 0.95) * -28;
  const exit = stage(progress, 0.62, 1);
  const scrollHint = 1 - stage(progress, 0.08, 0.35);
  const ctasIn = stage(progress, 0.12, 0.38);
  const ctasOpacity = ctasIn * (1 - exit * 0.85);
  const ctasY = (1 - ctasIn) * 20 + exit * -24;
  const ctasInteractive = ctasOpacity > 0.4 && exit < 0.75;
  const stickyFade = Math.max(0, 1 - stage(progress, 0.72, 1) * 0.55);

  return (
    <div ref={landingRef} className="landing">
      <div className="landing__atmosphere" aria-hidden="true" />

      <section ref={openingRef} className="opening" aria-label="Abertura">
        <div className="opening__sticky" style={{ opacity: stickyFade } as CSSProperties}>
          <div className="opening__media" aria-hidden="true">
            <div className="opening__sky" />
            <div className="opening__orb opening__orb--a" />
            <div className="opening__orb opening__orb--b" />
            <div className="opening__orb opening__orb--c" />
            <div className="opening__sheen" />
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
            <div className="opening__brand" aria-label={SITE.brand}>
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
            href="#vendas"
            className="opening__scroll"
            aria-label="Continuar para as vendas"
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
        <section className="story-chapter sales-showcase" data-chapter="sales" id="vendas">
          <div className="story-chapter__inner sales-showcase__inner">
            {salesItems.length === 0 ? (
              <p className="admin-muted" style={{ textAlign: "center" }}>
                Em breve novos produtos na loja.
              </p>
            ) : (
              <div className="sales-marquee" aria-label="Produtos à venda">
                <div className="sales-marquee__track">
                  {[0, 1].map((loop) => (
                    <div key={loop} className="sales-marquee__group" aria-hidden={loop === 1 || undefined}>
                      {salesItems.map((p, i) => {
                        return (
                          <Link
                            key={`${loop}-${p.id}-${i}`}
                            to="/loja"
                            className="sales-marquee__card"
                            title={p.name}
                          >
                            <span className="sales-marquee__media">
                              <ProductImageCarousel
                                images={productImageSlides(p)}
                                alt={p.name}
                                autoplayMs={2800 + (i % 4) * 400}
                                showControls={false}
                              />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sales-showcase__cta">
              <Link to="/loja" className="btn-primary btn-primary--lg">
                Ver todos na loja
              </Link>
            </div>
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
