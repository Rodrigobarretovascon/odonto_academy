import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { BrandIcon } from "../components/BrandIcon";
import { BrandLockup, HeartRule } from "../components/BrandMark";

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { hasAccess, user } = useAuth();

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  return (
    <div className="landing">
      <section className="hero hero--solo">
        <div className="hero__content">
          <h1 className="hero__brand">
            <BrandLockup size="lg" />
          </h1>
          <p className="hero__subtitle">
            Academia de escultura em cera e anatomia — 28 dentes, visualizador 3D e atlas
            vivo para estudar com delicadeza e precisão.
          </p>
          <div className="hero__actions">
            {user ? (
              <>
                <Link to="/app/escultura/13" className="btn-primary btn-primary--lg">
                  Escultura em Cera
                </Link>
                {hasAccess && (
                  <Link to="/app" className="btn-outline btn-outline--lg">
                    Minha Academia
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/loja" className="btn-primary btn-primary--lg">
                  Ver planos
                </Link>
                <Link to="/login" className="btn-outline btn-outline--lg">
                  Já sou aluna
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <HeartRule className="landing__rule" />

      <section className="section section--exclusive">
        <div className="section__header">
          <h2>Conteúdo exclusivo para assinantes</h2>
          <p>
            Após a compra, você recebe acesso por tempo limitado à área premium com escultura,
            anatomia e novidades enviadas pela Gabriela.
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: "tooth" as const,
              title: "Escultura em Cera",
              desc: "28 dentes com medidas, faces, oclusal e vistas finais",
              to: user ? "/app/escultura/13" : "/loja",
            },
            {
              icon: "anatomy" as const,
              title: "Anatomia Dental",
              desc: "Atlas vivo com jornadas e morfologia para esculpir",
              to: hasAccess ? "/app/anatomia" : "/loja",
            },
            {
              icon: "spark" as const,
              title: "Visualizador 3D",
              desc: "Gire o dente e estude cada face com textura original",
              to: user ? "/app/escultura/13" : "/loja",
            },
            {
              icon: "chat" as const,
              title: "Assistente IA",
              desc: "Tire dúvidas durante a escultura com orientação clara",
              to: hasAccess ? "/app/ia" : "/loja",
            },
          ].map((f) => (
            <Link key={f.title} to={f.to} className="feature-card feature-card--link">
              <BrandIcon name={f.icon} />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--shop" id="loja">
        <div className="section__header">
          <h2>Nossos produtos</h2>
          <p>Dois caminhos para elevar sua escultura — escolha o ideal para você.</p>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <p className="section__note">
          Imagens ilustrativas · Produtos sujeitos a disponibilidade
        </p>
      </section>

      <section className="section section--cta">
        <div className="cta-banner">
          <BrandLockup size="md" />
          <h2>Pronta para esculpir com confiança?</h2>
          <p>A partir de {products[0] ? formatPrice(products[0].price_cents) : "R$ 49,90"}/mês</p>
          <Link to="/loja" className="btn-primary">
            Começar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
