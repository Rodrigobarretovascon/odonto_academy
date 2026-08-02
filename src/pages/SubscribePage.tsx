import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { HeartRule } from "../components/BrandMark";
import { PageCard, PageShell } from "../components/PageShell";
import { SITE } from "../lib/site";

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
    a: "Não armazenamos dados completos de cartão. O checkout usa um provedor externo (Mercado Pago).",
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
    <PageShell
      eyebrow="GB Dental · Assinatura"
      title="Assine o GB Dental"
      lead="Estude escultura em cera, anatomia e tire dúvidas com IA — com delicadeza, precisão e conteúdo feito para a sua rotina."
      actions={
        hasAccess ? (
          <Link to="/app" className="btn-primary btn-primary--lg">
            Ir para minha conta
          </Link>
        ) : (
          <>
            <a href="#planos" className="btn-primary btn-primary--lg">
              Ver planos
            </a>
            <Link to="/acesso" className="btn-outline btn-outline--lg">
              Já sou assinante
            </Link>
          </>
        )
      }
      panelBody={<HeartRule className="page-panel__rule" />}
      footer={
        <p className="page-shell__support">
          Dúvidas? WhatsApp{" "}
          <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {SITE.whatsappDisplay}
          </a>
        </p>
      }
    >
      <PageCard wide title="Benefícios" lead="Tudo o que a assinatura libera na plataforma.">
        <ul className="subscribe-benefits">
          {BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </PageCard>

      <PageCard wide id="planos" title="Planos" lead="Escolha o acesso e finalize com segurança.">
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
      </PageCard>

      <PageCard wide title="Perguntas frequentes">
        <div className="subscribe-faq">
          {FAQ.map((item) => (
            <details key={item.q} className="subscribe-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </PageCard>

      <div className="cta-banner">
        <h2>Pronta para começar?</h2>
        <p>Odontologia feita para você — com assinatura que libera o melhor do GB Dental.</p>
        <Link to={user ? "/loja" : "/cadastro"} className="btn-primary">
          Assinar agora
        </Link>
      </div>
    </PageShell>
  );
}
