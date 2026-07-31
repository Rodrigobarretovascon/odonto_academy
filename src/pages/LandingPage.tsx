import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { BrandIcon } from "../components/BrandIcon";
import { BrandLockup, HeartRule } from "../components/BrandMark";
import { SITE } from "../lib/site";
import { RESUMOS } from "../data/resumos";

const FEATURES = [
  { title: "Resumos", desc: "Sínteses para revisar com foco.", to: "/resumos", icon: "spark" as const, needSub: true },
  { title: "Escultura em cera", desc: "28 dentes FDI, fases e vistas finais.", to: "/app/escultura/13", icon: "tooth" as const, needSub: true },
  { title: "Anatomia dental", desc: "Atlas vivo da boca e do periodonto.", to: "/app/anatomia", icon: "anatomy" as const, needSub: true },
  { title: "Visualizador 3D", desc: "Gire e estude cada dente em 3D.", to: "/app/visualizador-3d", icon: "spark" as const, needSub: true },
  { title: "IA para tirar dúvidas", desc: "Apoio educacional no chat.", to: "/ia", icon: "chat" as const, needSub: true },
  { title: "Perguntas odontológicas", desc: "Perguntas e respostas por tema.", to: "/perguntas", icon: "chat" as const, needSub: true },
  { title: "Loja", desc: "Produtos e planos de acesso.", to: "/loja", icon: "tooth" as const, needSub: false },
  { title: "Novidades", desc: "Atualizações da plataforma.", to: "/app/novidades", icon: "spark" as const, needSub: true },
];

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { hasAccess, user } = useAuth();

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  const canAccessMembers = Boolean(hasAccess || user?.role === "admin");

  const featureTo = (f: (typeof FEATURES)[number]) => {
    if (f.needSub && !canAccessMembers) {
      if (!user) return "/login";
      return "/assinar";
    }
    if (f.to.startsWith("/app") && !user) return "/login";
    return f.to;
  };

  const featureState = (f: (typeof FEATURES)[number], to: string) => {
    if (to === "/login") return { from: f.to };
    if (to === "/assinar") return { needSubscription: true, from: f.to };
    return undefined;
  };

  return (
    <div className="landing">
      <section className="hero hero--immersive" aria-label="Destaque">
        <div className="hero__media" aria-hidden="true">
          <img
            src="/uploads/banners/banner-academia.jpg"
            alt=""
            className="hero__media-img"
          />
        </div>
        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__content">
          <h1 className="hero__brand">
            <BrandLockup size="lg" />
          </h1>

          <p className="hero__headline">
            {user ? (
              <>
                Bem-vinda de volta ao espaço que <em>une</em> estudo e <em>prática</em>
              </>
            ) : (
              <>
                A casa que <em>transforma</em> a forma de aprender <em>Odontologia</em>
              </>
            )}
          </p>

          <p className="hero__tagline">Ensina · Orienta · Cuida</p>
          <span className="hero__rule" aria-hidden="true" />

          <div className="hero__actions">
            {user ? (
              <>
                <Link to={hasAccess ? "/app" : "/assinar"} className="btn-primary btn-primary--lg">
                  {hasAccess ? "Minha conta" : "Assinar"}
                </Link>
                <a href="#explore" className="btn-outline btn-outline--lg">
                  Explorar
                </a>
              </>
            ) : (
              <>
                <Link to="/assinar" className="btn-primary btn-primary--lg">
                  Assinar
                </Link>
                <Link to="/login" className="btn-outline btn-outline--lg">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>

        <a href="#explore" className="hero__scroll" aria-label="Ver conteúdos seguintes">
          <span className="hero__scroll-line" aria-hidden="true" />
          Descubra
        </a>
      </section>

      <section className="section section--exclusive" id="explore">
        <div className="section__header">
          <h2>Explore a plataforma</h2>
          <p>Cards com os principais recursos — toque para abrir o conteúdo.</p>
        </div>
        <div className="feature-grid feature-grid--dense">
          {FEATURES.map((f) => {
            const to = featureTo(f);
            return (
              <Link
                key={f.title}
                to={to}
                state={featureState(f, to)}
                className="feature-card feature-card--link"
              >
                <BrandIcon name={f.icon} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                {f.needSub && <span className="feature-card__tag">Assinantes</span>}
              </Link>
            );
          })}
        </div>
      </section>

      <HeartRule className="landing__rule" />

      <section className="section" id="resumos-preview">
        <div className="section__header">
          <h2>Resumos para assinantes</h2>
          <p>
            {canAccessMembers
              ? "Acesse os resumos completos da sua assinatura."
              : "Exclusivo para assinantes. Assine para liberar resumos, perguntas e IA."}
          </p>
        </div>
        {canAccessMembers ? (
          <div className="resumo-grid">
            {RESUMOS.slice(0, 3).map((r) => (
              <article key={r.id} className="resumo-card">
                <span className="resumo-card__topic">{r.topic}</span>
                <h3>{r.title}</h3>
                <p>{r.preview}</p>
                <Link to="/resumos" className="btn-outline">
                  Ver resumos
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="help-links">
            <Link
              to={user ? "/assinar" : "/login"}
              state={user ? { needSubscription: true, from: "/resumos" } : { from: "/resumos" }}
              className="help-links__card"
            >
              Liberar resumos com a assinatura
            </Link>
            <Link
              to={user ? "/assinar" : "/login"}
              state={user ? { needSubscription: true, from: "/perguntas" } : { from: "/perguntas" }}
              className="help-links__card"
            >
              Perguntas odontológicas · Assinantes
            </Link>
            <Link
              to={user ? "/assinar" : "/login"}
              state={user ? { needSubscription: true, from: "/ia" } : { from: "/ia" }}
              className="help-links__card"
            >
              IA para tirar dúvidas · Assinantes
            </Link>
          </div>
        )}
      </section>

      <section className="section section--shop" id="patrocinadores">
        <div className="section__header">
          <h2>Patrocinadores e produtos</h2>
          <p>Apoios e itens da loja — visíveis na página inicial.</p>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <p className="section__note">Imagens ilustrativas · Produtos sujeitos a disponibilidade</p>
      </section>

      <section className="section section--help" id="ajuda">
        <div className="section__header">
          <h2>Precisa de ajuda?</h2>
          <p>Fale com a gente pelos canais oficiais.</p>
        </div>
        <div className="help-links">
          <a
            className="help-links__card"
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            className="help-links__card"
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
