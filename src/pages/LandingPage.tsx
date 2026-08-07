import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { BrandIcon } from "../components/BrandIcon";
import { SITE } from "../lib/site";

const FEATURES = [
  { title: "Resumos", desc: "Sínteses para revisar com foco.", to: "/resumos", icon: "spark" as const, needSub: true },
  { title: "Escultura em cera", desc: "28 dentes FDI, fases e vistas finais.", to: "/app/escultura/13", icon: "tooth" as const, needSub: true },
  { title: "Anatomia dental", desc: "Atlas vivo da boca e do periodonto.", to: "/app/anatomia", icon: "anatomy" as const, needSub: true },
  { title: "Visualizador 3D", desc: "Gire e estude cada dente em 3D.", to: "/app/visualizador-3d", icon: "spark" as const, needSub: true },
  { title: "IA para tirar dúvidas", desc: "Apoio educacional no chat.", to: "/app/ia", icon: "chat" as const, needSub: true },
  { title: "Perguntas odontológicas", desc: "Perguntas e respostas por tema.", to: "/perguntas", icon: "chat" as const, needSub: true },
];

function isSubscription(p: Product) {
  return p.type === "subscription";
}

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedBenefitsId, setPinnedBenefitsId] = useState<number | null>(null);
  const [hoverBenefitsId, setHoverBenefitsId] = useState<number | null>(null);
  const { hasAccess, user } = useAuth();
  const { add, has, quantityOf } = useCart();

  useEffect(() => {
    api<Product[]>("/products")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const canAccessMembers = Boolean(hasAccess || user?.role === "admin");
  const subscriptions = products.filter(isSubscription).sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.price_cents - b.price_cents;
  });
  const catalog = products.filter((p) => !isSubscription(p));

  const featureTo = (f: (typeof FEATURES)[number]) => {
    if (f.needSub && !canAccessMembers) return "/acesso";
    if (f.to.startsWith("/app") && !user) return "/acesso";
    return f.to;
  };

  return (
    <div className="landing landing--store">
      <section className="home-store" aria-label="Loja GB Dental" id="explore">
        <div className="home-store__inner">
          <section className="home-plans" aria-labelledby="home-plans-title">
            <div className="home-plans__head">
              <div>
                <p className="home-store__eyebrow">Assinaturas</p>
                <h2 id="home-plans-title">Acesso à plataforma</h2>
              </div>
              <Link to="/assinar" className="home-store__more">
                Comparar planos →
              </Link>
            </div>

            {loading && (
              <div className="page-loading" role="status">
                <div className="page-loading__spinner" />
              </div>
            )}

            {!loading && subscriptions.length === 0 && (
              <p className="home-store__empty">Nenhum plano disponível no momento.</p>
            )}

            <div className="home-plans__grid">
              {subscriptions.map((p) => {
                const effective = p.effective_price_cents ?? p.price_cents;
                const onPromo = effective < p.price_cents;
                const inCart = has(p.id);
                const benefitsOpen = pinnedBenefitsId === p.id || hoverBenefitsId === p.id;
                const panelId = `plan-benefits-${p.id}`;

                return (
                  <article
                    key={p.id}
                    className={`home-plan${p.featured ? " home-plan--featured" : ""}${inCart ? " is-in-cart" : ""}${benefitsOpen ? " is-open" : ""}`}
                    onMouseEnter={() => setHoverBenefitsId(p.id)}
                    onMouseLeave={() => setHoverBenefitsId((id) => (id === p.id ? null : id))}
                  >
                    <div className="home-plan__main">
                      <div className="home-plan__media" aria-hidden="true">
                        <img src={p.image_url} alt="" />
                      </div>
                      <div className="home-plan__body">
                        <div className="home-plan__copy">
                          {(p.featured || p.badge) && (
                            <span className="home-plan__ribbon">
                              {p.featured ? "Recomendado" : p.badge}
                            </span>
                          )}
                          <h3>{p.name}</h3>
                          <p className="home-plan__kicker">{p.subtitle}</p>
                          {p.characteristics && p.characteristics.length > 0 && (
                            <p className="home-plan__perks-inline">
                              {p.characteristics.slice(0, 3).join(" · ")}
                            </p>
                          )}
                          <button
                            type="button"
                            className="home-plan__toggle"
                            aria-expanded={benefitsOpen}
                            aria-controls={panelId}
                            onClick={() =>
                              setPinnedBenefitsId((id) => (id === p.id ? null : p.id))
                            }
                          >
                            {pinnedBenefitsId === p.id
                              ? "Ocultar o que libera"
                              : "O que a assinatura libera"}
                          </button>
                        </div>
                        <div className="home-plan__buy">
                          <div>
                            {onPromo && (
                              <s className="home-plan__price-old">{formatPrice(p.price_cents)}</s>
                            )}
                            <p className="home-plan__price">{formatPrice(effective)}</p>
                            {p.access_days > 0 && (
                              <p className="home-plan__term">{p.access_days} dias</p>
                            )}
                          </div>
                          <button type="button" className="btn-primary btn-primary--sm" onClick={() => add(p)}>
                            {inCart ? `Carrinho (${quantityOf(p.id)})` : "Assinar"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      id={panelId}
                      className="home-plan__benefits"
                      aria-hidden={!benefitsOpen}
                    >
                      <p className="home-plan__benefits-label">Inclui na assinatura</p>
                      <ul className="home-plan__benefits-list">
                        {FEATURES.map((f) => {
                          const to = featureTo(f);
                          return (
                            <li key={f.title}>
                              <Link
                                to={to}
                                state={to === "/acesso" ? { from: f.to } : undefined}
                                className="home-plan__benefit"
                                tabIndex={benefitsOpen ? undefined : -1}
                              >
                                <BrandIcon name={f.icon} size={18} />
                                <span>
                                  <strong>{f.title}</strong>
                                  <small>{f.desc}</small>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {catalog.length > 0 && (
            <section className="home-catalog" aria-labelledby="home-catalog-title">
              <div className="home-plans__head">
                <div>
                  <p className="home-store__eyebrow">Materiais</p>
                  <h2 id="home-catalog-title">Para a prática e o estudo</h2>
                </div>
                <Link to="/loja" className="home-store__more">
                  Ver loja completa →
                </Link>
              </div>
              <div className="home-catalog__grid">
                {catalog.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <section className="home-band" id="como-funciona" aria-labelledby="how-title">
        <div className="home-band__inner">
          <header className="home-band__header">
            <p className="home-store__eyebrow">Como funciona</p>
            <h2 id="how-title">Loja e plataforma no mesmo lugar</h2>
            <p>
              Materiais selecionados, conteúdos exclusivos e orientação prática — para estudar e evoluir com
              clareza.
            </p>
          </header>
          <div className="home-band__actions">
            <Link to="/assinar" className="btn-primary">
              Ver assinaturas
            </Link>
            <a href="#explore" className="btn-outline">
              Ver planos
            </a>
          </div>
        </div>
      </section>

      <section className="home-band" id="ajuda" aria-labelledby="help-title">
        <div className="home-band__inner home-band__inner--split">
          <header className="home-band__header">
            <p className="home-store__eyebrow">Contato</p>
            <h2 id="help-title">Precisa de ajuda?</h2>
            <p>Fale conosco pelos canais oficiais.</p>
          </header>
          <div className="home-band__actions">
            <a className="btn-outline" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="btn-outline" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
