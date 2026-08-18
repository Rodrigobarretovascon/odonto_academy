import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { SITE } from "../lib/site";

export function PublicLayout() {
  const { count } = useCart();
  const { user, hasAccess, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const hideFooter = location.pathname === "/loja" || location.pathname === "/";
  const brandLogo =
    theme === "dark"
      ? "/images/brand/gbd-logo-full-dark.png?v=4"
      : "/images/brand/gbd-logo-wordmark.png?v=4";
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `terus-nav__link${isActive ? " terus-nav__link--active" : ""}`;

  const goTopAndClose = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <div className={`terus-app${hideFooter ? " terus-app--cart-desk" : ""}`}>
      <header className="terus-header terus-header--centered">
        <Link
          to="/"
          className="terus-header__center-brand"
          aria-label={`${SITE.brand} — início`}
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
        >
          <img
            src={brandLogo}
            alt="Gabriela Barreto Dental"
            className="terus-header__center-brand-img"
            decoding="async"
          />
        </Link>

        <div className="terus-header__right">
        <nav id="public-nav" className={`terus-nav${menuOpen ? " is-open" : ""}`} aria-label="Principal">
          {!user ? (
            <>
              <NavLink to="/" end className={navLink} onClick={goTopAndClose}>
                Início
              </NavLink>
              <NavLink to="/loja" className={navLink} onClick={goTopAndClose}>
                Loja
              </NavLink>
              <NavLink
                to="/assinar"
                className={({ isActive }) => `${navLink({ isActive })} terus-nav__link--gold`}
                onClick={goTopAndClose}
              >
                Assinar
              </NavLink>
              <NavLink to="/acesso" className={navLink} onClick={goTopAndClose}>
                Fazer login
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={navLink} onClick={goTopAndClose}>
                Início
              </NavLink>
              <NavLink to="/loja" className={navLink} onClick={goTopAndClose}>
                Loja
              </NavLink>
              <NavLink
                to="/assinar"
                className={({ isActive }) => `${navLink({ isActive })} terus-nav__link--gold`}
                onClick={goTopAndClose}
              >
                Assinaturas
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={navLink} onClick={goTopAndClose}>
                  Admin
                </NavLink>
              )}
              <button
                type="button"
                className="terus-nav__link terus-nav__link--action terus-nav__link--mobile-only"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate("/acesso");
                }}
              >
                Trocar de conta
              </button>
            </>
          )}
        </nav>

        <div className="terus-header__actions">
          <ThemeToggle className="theme-toggle--header" />
          <Link to="/loja" className="terus-cart-btn" aria-label={`Carrinho, ${count} itens`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.6L5 4H2" />
              <circle cx="9" cy="20" r="1.2" />
              <circle cx="18" cy="20" r="1.2" />
            </svg>
            {count > 0 && <span className="terus-cart-btn__badge">{count}</span>}
          </Link>

          {user && (
            <div className="account-menu account-menu--desktop" ref={accountRef}>
              <button
                type="button"
                className="account-menu__trigger"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                {user.name.split(" ")[0]}
              </button>
              {accountOpen && (
                <div className="account-menu__dropdown" role="menu">
                  <Link to="/app" role="menuitem">
                    Minha conta
                  </Link>
                  {hasAccess && (
                    <Link to="/app/escultura/13" role="menuitem">
                      Área de assinante
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      navigate("/acesso");
                    }}
                  >
                    Trocar de conta
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="terus-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="public-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="visually-hidden">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
            <span className="terus-nav-toggle__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        </div>
      </header>

      <main className="terus-main">
        <Outlet />
      </main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
