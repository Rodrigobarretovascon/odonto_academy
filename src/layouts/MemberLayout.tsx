import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLockup, BrandMark, HeartRule } from "../components/BrandMark";
import { AiMascot } from "../components/AiMascot";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeToggle } from "../components/ThemeToggle";

const NAV = [
  { to: "/app/resumos", label: "Resumos" },
  { to: "/app/escultura/13", label: "Escultura em cera" },
  { to: "/app/ia", label: "Odus IA" },
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
  const isSculpture = location.pathname.startsWith("/app/escultura");
  const isAi = location.pathname.startsWith("/app/ia");
  const isAnatomy = location.pathname.startsWith("/app/anatomia");
  const compactTop = isSculpture || isAi || isAnatomy;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  const shellClass = [
    "terus-app",
    "terus-app--member",
    isSculpture ? "terus-app--sculpture" : "",
    isAi ? "terus-app--ai" : "",
    isAnatomy ? "terus-app--anatomy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <header
        className={`member-topbar${compactTop ? " member-topbar--sculpture" : ""}`}
      >
        <button
          type="button"
          className="member-topbar__menu"
          aria-expanded={open}
          aria-controls="member-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? "Fechar menu" : "Abrir menu"}</span>
          <span className="member-topbar__burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        {isSculpture ? (
          <div className="member-topbar__section" aria-label="Escultura Dental">
            <BrandMark size={28} />
            <div className="member-topbar__section-text">
              <p className="member-topbar__section-title">Escultura Dental</p>
              <HeartRule className="member-topbar__section-rule" />
            </div>
          </div>
        ) : isAi ? (
          <div className="member-topbar__section" aria-label="Odus">
            <AiMascot size={48} className="member-topbar__ai-mascot" />
            <div className="member-topbar__section-text">
              <p className="member-topbar__section-title">Odus</p>
              <p className="member-topbar__section-sub">fantasminha IA</p>
              <HeartRule className="member-topbar__section-rule" />
            </div>
          </div>
        ) : isAnatomy ? (
          <div className="member-topbar__section" aria-label="Anatomia dental">
            <BrandMark size={28} />
            <div className="member-topbar__section-text">
              <p className="member-topbar__section-title">Anatomia dental</p>
              <HeartRule className="member-topbar__section-rule" />
            </div>
          </div>
        ) : (
          <NavLink to="/app" className="member-topbar__brand" aria-label="GB Dental — minha conta">
            <BrandLockup size="sm" />
          </NavLink>
        )}

        <ThemeToggle className="theme-toggle--member" />
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
        {!isAi && !isAnatomy && <SiteFooter />}
      </div>
    </div>
  );
}
