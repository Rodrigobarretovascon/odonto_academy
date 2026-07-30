import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandIcon } from "../components/BrandIcon";

export function MemberHomePage() {
  const { user, subscription, hasAccess } = useAuth();
  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="member-home">
      <header className="member-home__hero">
        <p className="hero__eyebrow">Bem-vindo ao site.</p>
        <h1>{user?.name?.split(" ")[0]}, sua área GB Dental</h1>
        {daysLeft !== null ? (
          <p className="member-home__access">
            Acesso ativo · <strong>{daysLeft} dias</strong> restantes
          </p>
        ) : (
          !hasAccess && (
            <p className="member-home__access">
              Sem assinatura ativa. <Link to="/assinar">Assinar para liberar conteúdos</Link>
            </p>
          )
        )}
      </header>
      <div className="member-home__grid">
        <Link to="/app/escultura/13" className="member-tile member-tile--featured">
          <BrandIcon name="tooth" />
          <h2>Escultura em cera</h2>
          <p>28 dentes · fases · vistas finais</p>
        </Link>
        <Link to="/app/anatomia" className="member-tile">
          <BrandIcon name="anatomy" />
          <h2>Anatomia dental</h2>
          <p>Atlas vivo e estruturas clicáveis</p>
        </Link>
        <Link to="/app/visualizador-3d" className="member-tile">
          <BrandIcon name="spark" />
          <h2>Visualizador 3D</h2>
          <p>Rotação, zoom e seleção por FDI</p>
        </Link>
        <Link to="/app/ia" className="member-tile">
          <BrandIcon name="chat" />
          <h2>Tire dúvidas com IA</h2>
          <p>Chat educacional com histórico</p>
        </Link>
        <Link to="/app/resumos" className="member-tile">
          <BrandIcon name="spark" />
          <h2>Resumos</h2>
          <p>Sínteses para revisar</p>
        </Link>
        <Link to="/app/novidades" className="member-tile">
          <BrandIcon name="spark" />
          <h2>Novidades</h2>
          <p>Atualizações da plataforma</p>
        </Link>
      </div>
    </div>
  );
}
