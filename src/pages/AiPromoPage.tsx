import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ToothMascot } from "../components/ToothMascot";
import { PageShell } from "../components/PageShell";

/** Entrada pública /ia — decide login, oferta ou chat. */
export function AiPromoPage() {
  const { user, hasAccess, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        <ToothMascot mood="spin" label="Carregando" />
        <p>Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <PageShell
        narrow
        eyebrow="GB Dental · IA"
        title="Tire dúvidas com IA"
        lead="Entre na sua conta para continuar. Se ainda não for assinante, você verá os benefícios e poderá assinar em seguida."
        actions={
          <>
            <Link to="/acesso" state={{ from: "/ia" }} className="btn-primary btn-primary--lg">
              Entrar na minha conta
            </Link>
            <Link to="/cadastro" state={{ from: "/ia" }} className="btn-outline btn-outline--lg">
              Criar conta
            </Link>
          </>
        }
      />
    );
  }

  if (hasAccess || user.role === "admin") {
    return (
      <PageShell
        narrow
        eyebrow="GB Dental · IA"
        title="Abrindo o chat…"
        lead="Você já tem acesso. Continue para o assistente educacional."
        actions={
          <Link to="/app/ia" state={location.state} className="btn-primary btn-primary--lg">
            Ir para o chat com IA
          </Link>
        }
      />
    );
  }

  return (
    <PageShell
      narrow
      eyebrow="GB Dental · IA"
      title="IA exclusiva para assinantes"
      lead="Com a assinatura GB Dental você tira dúvidas sobre escultura, anatomia e estudo — com histórico de conversa e aviso de uso educacional."
      actions={
        <>
          <Link to="/assinar" className="btn-primary btn-primary--lg">
            Assinar agora
          </Link>
          <Link to="/loja" className="btn-outline btn-outline--lg">
            Ver a loja
          </Link>
        </>
      }
    >
      <div className="page-card page-card--wide">
        <ul className="subscribe-benefits">
          <li>Respostas no contexto do dente que você está estudando</li>
          <li>Acesso junto com escultura, anatomia e visualizador 3D</li>
          <li>Não substitui avaliação clínica profissional</li>
        </ul>
      </div>
    </PageShell>
  );
}
