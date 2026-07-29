import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/BrandMark";
import { SiteFooter } from "../components/SiteFooter";

const NAV = [
  { to: "/app", label: "Início", end: true },
  { to: "/app/escultura/13", label: "Escultura em Cera" },
  { to: "/app/anatomia", label: "Anatomia Dental" },
  { to: "/app/ia", label: "Tirar Dúvidas (IA)" },
  { to: "/app/novidades", label: "Novidades" },
];

export function MemberLayout() {
  const { user, subscription, logout } = useAuth();
  const navigate = useNavigate();

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="terus-app terus-app--member">
      <aside className="member-sidebar">
        <div className="member-sidebar__brand">
          <BrandLockup size="sm" />
          <div className="member-sidebar__user">
            <strong>Academia Exclusiva</strong>
            <small>{user?.name}</small>
          </div>
        </div>
        {daysLeft !== null && (
          <div className="member-sidebar__access">
            <span className="member-sidebar__access-label">Acesso ativo</span>
            <strong>{daysLeft} dias restantes</strong>
            <small>{subscription?.product_name}</small>
          </div>
        )}
        <nav className="member-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `member-sidebar__link${isActive ? " member-sidebar__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className="member-sidebar__link member-sidebar__link--admin">
              Administração
            </NavLink>
          )}
        </nav>
        <div className="member-sidebar__footer">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sair
          </button>
          <NavLink to="/" className="btn-ghost">
            Ver loja
          </NavLink>
        </div>
      </aside>
      <div className="member-content">
        <Outlet />
        <SiteFooter />
      </div>
    </div>
  );
}
