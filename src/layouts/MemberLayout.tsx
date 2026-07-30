import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/BrandMark";
import { SiteFooter } from "../components/SiteFooter";

const NAV = [
  { to: "/app/resumos", label: "Resumos" },
  { to: "/app/escultura/13", label: "Escultura em cera" },
  { to: "/app/ia", label: "Tire dúvidas com IA" },
  { to: "/app/anatomia", label: "Anatomia dental" },
  { to: "/app/visualizador-3d", label: "Visualizador 3D" },
  { to: "/app/novidades", label: "Novidades" },
  { to: "/app", label: "Minha conta", end: true },
];

export function MemberLayout() {
  const { user, subscription, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="terus-app terus-app--member">
      <header className="member-topbar">
        <button
          type="button"
          className="member-topbar__menu"
          aria-expanded={open}
          aria-controls="member-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? "Fechar menu" : "Abrir menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <LinkBrand />
        <span className="member-topbar__user">{user?.name.split(" ")[0]}</span>
      </header>

      {open && (
        <button
          type="button"
          className="member-drawer-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside id="member-drawer" className={`member-sidebar${open ? " is-open" : ""}`}>
        <div className="member-sidebar__brand">
          <BrandLockup size="sm" />
          <div className="member-sidebar__user">
            <strong>Área de assinantes</strong>
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
        <nav className="member-sidebar__nav" aria-label="Área de assinantes">
          {NAV.map((item) => (
            <NavLink
              key={item.to + item.label}
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
              navigate("/login");
            }}
          >
            Trocar de conta
          </button>
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
        </div>
      </aside>

      <div className="member-content">
        <Outlet />
        <SiteFooter />
      </div>
    </div>
  );
}

function LinkBrand() {
  return (
    <NavLink to="/app" className="member-topbar__brand" aria-label="GB Dental — minha conta">
      <BrandLockup size="sm" />
    </NavLink>
  );
}
