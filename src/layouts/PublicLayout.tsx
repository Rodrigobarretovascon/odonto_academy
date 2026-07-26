import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export function PublicLayout() {
  const { count } = useCart();
  const { user, hasAccess } = useAuth();

  return (
    <div className="terus-app">
      <header className="terus-header">
        <Link to="/" className="terus-brand">
          <span className="terus-brand__mark">GB</span>
          <span className="terus-brand__text">
            Gabriela Barreto
            <small>Dental</small>
          </span>
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
            </>
          ) : (
            <NavLink to="/login" className="terus-nav__link">
              Entrar
            </NavLink>
          )}
        </nav>
        <div className="terus-header__actions">
          <Link to="/carrinho" className="terus-cart-btn" aria-label={`Carrinho, ${count} itens`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="terus-cart-btn__badge">{count}</span>}
          </Link>
          {user && (
            <span className="terus-header__user">{user.name.split(" ")[0]}</span>
          )}
        </div>
      </header>
      <main className="terus-main">
        <Outlet />
      </main>
      <footer className="terus-footer">
        <p>© {new Date().getFullYear()} Gabriela Barreto Dental · Escultura & Anatomia</p>
        <p className="terus-footer__credit">
          Modelos 3D: University of Dundee, School of Dentistry (CC BY)
        </p>
      </footer>
    </div>
  );
}
