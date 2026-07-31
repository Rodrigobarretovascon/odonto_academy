import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { BrandLockup, HeartRule } from "../components/BrandMark";

const BENEFITS = [
  "Escultura em cera dos 28 dentes com fases e vistas finais",
  "Anatomia dental interativa e atlas vivo",
  "Visualizador 3D dedicado",
  "IA para tirar dúvidas (uso educacional)",
  "Resumos e perguntas odontológicas completos",
  "Novidades e atualizações da plataforma",
];

const FAQ = [
  {
    q: "O que acontece após o pagamento?",
    a: "Com pagamento aprovado, sua assinatura é liberada automaticamente e você acessa a área de assinantes.",
  },
  {
    q: "Posso cancelar?",
    a: "Sim. Assinaturas canceladas ou expiradas deixam de liberar conteúdos exclusivos; você continua podendo usar a loja.",
  },
  {
    q: "O pagamento é seguro?",
    a: "Não armazenamos dados completos de cartão. O checkout usa um provedor externo (Mercado Pago). Configure as chaves no servidor para ativar cobrança real.",
  },
];

export function SubscribePage() {
  const { user, hasAccess } = useAuth();
  const [plans, setPlans] = useState<Product[]>([]);

  useEffect(() => {
    api<Product[]>("/products")
      .then((list) => setPlans(list.filter((p) => p.type === "subscription" || p.access_days > 0)))
      .catch(console.error);
  }, []);

  return (
    <div className="subscribe-page">
      <section className="subscribe-hero">
        <BrandLockup size="md" />
        <h1>Assine o GB Dental</h1>
        <p>
          Estude escultura em cera, anatomia e tire dúvidas com IA — com delicadeza, precisão e
          conteúdo feito para a sua rotina.
        </p>
        {hasAccess ? (
          <Link to="/app" className="btn-primary btn-primary--lg">
            Ir para minha conta
          </Link>
        ) : (
          <a href="#planos" className="btn-primary btn-primary--lg">
            Ver planos
          </a>
        )}
      </section>

      <HeartRule className="landing__rule" />

      <section className="section" id="beneficios">
        <div className="section__header">
          <h2>Benefícios</h2>
          <p>Tudo o que a assinatura libera na plataforma.</p>
        </div>
        <ul className="subscribe-benefits">
          {BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="section" id="planos">
        <div className="section__header">
          <h2>Planos</h2>
          <p>Escolha o acesso e finalize com segurança.</p>
        </div>
        <div className="subscribe-plans">
          {plans.length === 0 ? (
            <p className="admin-muted">
              Nenhum plano de assinatura cadastrado ainda. Use a loja ou peça ao admin para criar um
              produto com dias de acesso.
            </p>
          ) : (
            plans.map((p) => (
              <article key={p.id} className="subscribe-plan-card">
                {p.badge && <span className="subscribe-plan-card__badge">{p.badge}</span>}
                <h3>{p.name}</h3>
                <p className="subscribe-plan-card__price">{formatPrice(p.price_cents)}</p>
                <p>{p.subtitle || p.description}</p>
                <p className="subscribe-plan-card__meta">
                  {p.access_days > 0 ? `${p.access_days} dias de acesso` : "Acesso conforme o plano"}
                </p>
                <Link
                  to={user ? "/loja" : "/cadastro"}
                  state={{ subscribeProductId: p.id }}
                  className="btn-primary"
                >
                  {user ? "Ir para a loja" : "Criar conta e assinar"}
                </Link>
              </article>
            ))
          )}
        </div>
        <p className="section__note">
          Gateway: Mercado Pago (recomendado). Variáveis necessárias no servidor:{" "}
          <code>MERCADOPAGO_ACCESS_TOKEN</code>, <code>MERCADOPAGO_PUBLIC_KEY</code>,{" "}
          <code>PAYMENT_WEBHOOK_SECRET</code>. Enquanto não configurado, o checkout permanece em modo{" "}
          <strong>demo</strong> (pagamento simulado).
        </p>
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Perguntas frequentes</h2>
        </div>
        <div className="subscribe-faq">
          {FAQ.map((item) => (
            <details key={item.q} className="subscribe-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section section--cta">
        <div className="cta-banner">
          <h2>Pronta para começar?</h2>
          <p>Odontologia feita para você — com assinatura que libera o melhor do GB Dental.</p>
          <Link to={user ? "/loja" : "/cadastro"} className="btn-primary">
            Assinar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
