import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { contentSlides } from "../data/content-manifest";
import { BrandIcon } from "../components/BrandIcon";

export function MemberHomePage() {
  const { user, subscription } = useAuth();
  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="member-home">
      <header className="member-home__hero">
        <p className="hero__eyebrow">Bem-vinda de volta</p>
        <h1>{user?.name?.split(" ")[0]}, sua academia está pronta</h1>
        {daysLeft !== null && (
          <p className="member-home__access">
            Acesso ativo · <strong>{daysLeft} dias</strong> restantes
          </p>
        )}
      </header>
      <div className="member-home__grid">
        <Link to="/app/escultura/13" className="member-tile member-tile--featured">
          <BrandIcon name="tooth" />
          <h2>Escultura em Cera</h2>
          <p>28 dentes · passo a passo · vistas finais · 3D</p>
        </Link>
        <Link to="/app/anatomia" className="member-tile">
          <BrandIcon name="anatomy" />
          <h2>Anatomia Dental</h2>
          <p>
            {contentSlides.length > 0
              ? "Atlas vivo · 7 jornadas · morfologia para esculpir"
              : "Faces, oclusal, sulcos e estruturas"}
          </p>
        </Link>
        <Link to="/app/ia" className="member-tile">
          <BrandIcon name="chat" />
          <h2>Tirar Dúvidas</h2>
          <p>Assistente IA para escultura</p>
        </Link>
        <Link to="/app/novidades" className="member-tile">
          <BrandIcon name="spark" />
          <h2>Novidades</h2>
          <p>Conteúdos novos da Gabriela</p>
        </Link>
      </div>
    </div>
  );
}
