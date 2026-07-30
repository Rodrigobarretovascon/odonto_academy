import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/BrandMark";
import { SiteFooter } from "../components/SiteFooter";
import { PromoBannerRail } from "../components/PromoBannerRail";

export function PublicLayout() {
  const { count } = useCart();
  const { user, hasAccess, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hideFooter = location.pathname === "/loja";
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `terus-nav__link${isActive ? " terus-nav__link--active" : ""}`;

  return (
    <div className={`terus-app${hideFooter ? " terus-app--cart-desk" : ""}`}>
      <header className="terus-header">
        <Link to="/" className="terus-brand" aria-label="GB Dental — início">
          <BrandLockup size="sm" />
        </Link>

        <button
          type="button"
          className="terus-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="public-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="visually-hidden">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <nav id="public-nav" className={`terus-nav${menuOpen ? " is-open" : ""}`} aria-label="Principal">
          <NavLink to="/" end className={navLink}>
            Início
          </NavLink>
          <NavLink to="/o-que-somos" className={navLink}>
            O que somos
          </NavLink>
          <NavLink to="/como-funciona" className={navLink}>
            Como funciona
          </NavLink>
          <NavLink to="/recursos" className={navLink}>
            Recursos
          </NavLink>
          <NavLink to="/perguntas" className={navLink}>
            Perguntas
          </NavLink>
          <NavLink to="/loja" className={navLink}>
            Loja
          </NavLink>
          <NavLink to="/ia" className={navLink}>
            IA
          </NavLink>
          <NavLink
            to="/assinar"
            className={({ isActive }) => `${navLink({ isActive })} terus-nav__link--gold`}
          >
            Assinar
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLink}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="terus-header__actions">
          <Link to="/loja" className="terus-cart-btn" aria-label={`Carrinho, ${count} itens`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.6L5 4H2" />
              <circle cx="9" cy="20" r="1.2" />
              <circle cx="18" cy="20" r="1.2" />
            </svg>
            {count > 0 && <span className="terus-cart-btn__badge">{count}</span>}
          </Link>

          <div className="account-menu" ref={accountRef}>
            {user ? (
              <>
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
                        navigate("/login");
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
              </>
            ) : (
              <NavLink to="/login" className="terus-nav__link">
                Entrar
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <PromoBannerRail />
      <main className="terus-main">
        <Outlet />
      </main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
