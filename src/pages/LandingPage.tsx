import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { hasAccess, user } = useAuth();

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Odontologia · Escultura · Anatomia</p>
          <h1 className="hero__title">
            Domine a escultura dental em cera com a{" "}
            <span className="text-gold">Academia Gabriela Barreto</span>
          </h1>
          <p className="hero__subtitle">
            Guia completo dos 28 dentes permanentes, visualizador 3D interativo, anatomia
            detalhada e assistente para suas dúvidas — tudo em uma plataforma exclusiva.
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
        <div className="hero__visual">
          <div className="hero__card hero__card--1">
            <span>28 dentes</span>
            <small>Guia passo a passo</small>
          </div>
          <div className="hero__card hero__card--2">
            <span>3D interativo</span>
            <small>Gire cada dente</small>
          </div>
          <div className="hero__card hero__card--3">
            <span>IA assistente</span>
            <small>Tire dúvidas ao esculpir</small>
          </div>
        </div>
      </section>

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
              icon: "🦷",
              title: "Escultura em Cera",
              desc: "28 dentes com medidas, faces, oclusal e vistas finais",
              to: user ? "/app/escultura/13" : "/loja",
            },
            {
              icon: "🔬",
              title: "Anatomia Dental",
              desc: "Estudo detalhado de cada face e estrutura",
              to: hasAccess ? "/app/anatomia" : "/loja",
            },
            {
              icon: "🎯",
              title: "Visualizador 3D",
              desc: "Gire o dente como no BoneBox",
              to: user ? "/app/escultura/13" : "/loja",
            },
            {
              icon: "💬",
              title: "Assistente IA",
              desc: "Tire dúvidas durante a escultura",
              to: hasAccess ? "/app/ia" : "/loja",
            },
          ].map((f) => (
            <Link key={f.title} to={f.to} className="feature-card feature-card--link">
              <span className="feature-card__icon">{f.icon}</span>
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
