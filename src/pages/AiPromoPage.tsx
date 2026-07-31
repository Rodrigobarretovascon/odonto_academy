import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ToothMascot } from "../components/ToothMascot";

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
      <div className="content-page ai-promo">
        <ToothMascot mood="idle" label="Mascote dentinho" size={72} />
        <h1>Tire dúvidas com IA</h1>
        <p className="content-page__lead">
          Entre na sua conta para continuar. Se ainda não for assinante, você verá os benefícios e
          poderá assinar em seguida.
        </p>
        <div className="content-page__actions">
          <Link to="/login" state={{ from: "/ia" }} className="btn-primary">
            Entrar
          </Link>
          <Link to="/cadastro" state={{ from: "/ia" }} className="btn-outline">
            Criar conta
          </Link>
        </div>
      </div>
    );
  }

  if (hasAccess || user.role === "admin") {
    // Redirect handled by route wrapper — keep fallback
    return (
      <div className="content-page ai-promo">
        <p>Abrindo o chat…</p>
        <Link to="/app/ia" state={location.state} className="btn-primary">
          Ir para o chat com IA
        </Link>
      </div>
    );
  }

  return (
    <div className="content-page ai-promo">
      <ToothMascot mood="idle" label="Mascote dentinho" size={72} />
      <h1>IA exclusiva para assinantes</h1>
      <p className="content-page__lead">
        Com a assinatura GB Dental você tira dúvidas sobre escultura, anatomia e estudo — com
        histórico de conversa e aviso de uso educacional.
      </p>
      <ul className="subscribe-benefits">
        <li>Respostas no contexto do dente que você está estudando</li>
        <li>Acesso junto com escultura, anatomia e visualizador 3D</li>
        <li>Não substitui avaliação clínica profissional</li>
      </ul>
      <div className="content-page__actions">
        <Link to="/assinar" className="btn-primary">
          Assinar agora
        </Link>
        <Link to="/loja" className="btn-outline">
          Ver a loja
        </Link>
      </div>
    </div>
  );
}
