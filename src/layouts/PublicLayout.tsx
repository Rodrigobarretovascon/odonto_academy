import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/BrandMark";
import { SiteFooter } from "../components/SiteFooter";
import { PromoBannerRail } from "../components/PromoBannerRail";

export function PublicLayout() {
  const { count } = useCart();
  const { user, hasAccess } = useAuth();
  const location = useLocation();
  const hideFooter = location.pathname === "/loja";

  return (
    <div className={`terus-app${hideFooter ? " terus-app--cart-desk" : ""}`}>
      <header className="terus-header">
        <Link to="/" className="terus-brand" aria-label="GB Dental">
          <BrandLockup size="sm" />
        </Link>
        <nav className="terus-nav" aria-label="Principal">
          <NavLink to="/" end className="terus-nav__link">
            Início
          </NavLink>
          <NavLink to="/loja" className="terus-nav__link">
            Loja
          </NavLink>
          {user ? (
            <>
              <NavLink to="/app/escultura/13" className="terus-nav__link">
                Escultura em Cera
              </NavLink>
              {hasAccess && (
                <NavLink to="/app" className="terus-nav__link terus-nav__link--gold">
                  Minha Academia
                </NavLink>
              )}
              {user.role === "admin" && (
                <NavLink to="/admin" className="terus-nav__link">
                  Administração
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/login" className="terus-nav__link">
              Entrar
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
          {user && <span className="terus-header__user">{user.name.split(" ")[0]}</span>}
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
