import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { cartLineUnit, useCart } from "../context/CartContext";
import { InCartBadge } from "../components/InCartBadge";

/** Loja pública: produtos em destaque; carrinho em painel recolhível. */
export function ShopCartPage() {
  const { user } = useAuth();
  const { items, add, remove, setQuantity, clear, has, quantityOf, totalCents, count } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [flashId, setFlashId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const flashTimer = useRef<number | null>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    api<Product[]>("/products")
      .then((list) => {
        setProducts(list);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (count > prevCount.current) setCartOpen(true);
    prevCount.current = count;
  }, [count]);

  function onAdd(product: Product) {
    if (product.stock_qty != null && product.stock_qty <= 0) return;
    add(product);
    setFlashId(product.id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 900);
  }

  return (
    <div className={`shop-store${cartOpen ? " is-cart-open" : ""}`}>
      <header className="shop-hero">
        <div className="shop-hero__glow" aria-hidden="true" />
        <div className="shop-hero__wave" aria-hidden="true" />
        <span className="shop-hero__spark shop-hero__spark--a" aria-hidden="true" />
        <span className="shop-hero__spark shop-hero__spark--b" aria-hidden="true" />
        <span className="shop-hero__spark shop-hero__spark--c" aria-hidden="true" />

        <p className="shop-hero__eyebrow">
          <span className="shop-hero__eyebrow-star" aria-hidden="true" />
          Materiais dentais com elegância
        </p>

        <div className="shop-hero__brand">
          <img
            src="/images/brand/gbd-logo-mark-light.png?v=4"
            alt=""
            className="shop-hero__mark shop-hero__mark--light"
            decoding="async"
          />
          <img
            src="/images/brand/gbd-logo-mark-dark.png?v=4"
            alt=""
            className="shop-hero__mark shop-hero__mark--dark"
            decoding="async"
          />
          <div className="shop-hero__brand-text">
            <strong>Gabriela Barreto</strong>
            <span>Dental</span>
          </div>
        </div>

        <h1 className="shop-hero__title">
          Seu consultório com <em>cuidado</em> e excelência
        </h1>
        <p className="shop-hero__lead">
          Lecrons, ceras e materiais selecionados — toque em um produto para adicionar ao carrinho.
        </p>

        <div className="shop-hero__pills" aria-hidden="true">
          <span>Escultura</span>
          <span>Ceras</span>
          <span>Instrumentos</span>
        </div>
      </header>

      <section id="loja-produtos" className="shop-store__catalog" aria-label="Produtos">
        {loadError && (
          <p className="shop-store__empty">Não foi possível carregar os produtos. Tente novamente.</p>
        )}
        {!loadError && products.length === 0 && (
          <p className="shop-store__empty">Carregando vitrine…</p>
        )}
        <div className="shop-store__grid">
          {products.map((p) => {
            const inCart = has(p.id);
            const out = p.stock_qty != null && p.stock_qty <= 0;
            return (
              <button
                key={p.id}
                type="button"
                className={`shop-store__card${inCart ? " is-in-cart" : ""}${flashId === p.id ? " is-flash" : ""}${out ? " is-out" : ""}`}
                onClick={() => onAdd(p)}
                disabled={out}
                title={out ? "Esgotado" : inCart ? "Adicionar +1" : "Adicionar ao carrinho"}
              >
                <span className="shop-store__card-img">
                  {inCart && <InCartBadge quantity={quantityOf(p.id)} />}
                  <img
                    src={p.image_url}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.opacity = "0";
                    }}
                  />
                </span>
                <span className="shop-store__card-body">
                  {p.subtitle && <span className="shop-store__card-sub">{p.subtitle}</span>}
                  <span className="shop-store__card-name">{p.name}</span>
                  <span className="shop-store__card-price">
                    {formatPrice(p.effective_price_cents ?? p.price_cents)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {cartOpen && (
        <button
          type="button"
          className="shop-cart-scrim"
          aria-label="Fechar carrinho"
          onClick={() => setCartOpen(false)}
        />
      )}

      <aside className={`shop-cart-dock${cartOpen ? " is-open" : ""}${count > 0 ? " has-items" : ""}`} aria-label="Carrinho">
        <button
          type="button"
          className="shop-cart-dock__bar"
          aria-expanded={cartOpen}
          onClick={() => setCartOpen((v) => !v)}
        >
          <span className="shop-cart-dock__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.6L5 4H2" />
              <circle cx="9" cy="20" r="1.2" />
              <circle cx="18" cy="20" r="1.2" />
            </svg>
            {count > 0 && <span className="shop-cart-dock__badge">{count}</span>}
          </span>
          <span className="shop-cart-dock__summary">
            <strong>{cartOpen ? "Carrinho" : count ? `${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}</strong>
            <span>{count ? formatPrice(totalCents) : "Vazio — adicione produtos"}</span>
          </span>
          <span className="shop-cart-dock__chevron" aria-hidden="true">
            {cartOpen ? "▾" : "▴"}
          </span>
        </button>

        <div className="shop-cart-dock__panel" hidden={!cartOpen}>
          <div className="shop-cart-dock__panel-head">
            {!user ? (
              <p className="shop-cart-dock__hint">
                Entre para finalizar.{" "}
                <Link to="/acesso" state={{ from: "/loja" }} onClick={(e) => e.stopPropagation()}>
                  Fazer login
                </Link>
              </p>
            ) : (
              <p className="shop-cart-dock__hint">
                Comprador: <strong>{user.name}</strong>
              </p>
            )}
            <button type="button" className="btn-outline btn-outline--sm" onClick={clear} disabled={!count}>
              Limpar
            </button>
          </div>

          <div className="shop-cart-dock__items">
            {items.length === 0 ? (
              <p className="shop-cart-dock__empty">Nenhum item ainda. Escolha na vitrine acima.</p>
            ) : (
              <ul className="shop-cart-dock__lines">
                {items.map((line) => {
                  const unit = cartLineUnit(line);
                  return (
                    <li key={line.product.id} className="shop-cart-dock__line">
                      <img src={line.product.image_url} alt="" />
                      <div className="shop-cart-dock__line-info">
                        <strong>{line.product.name}</strong>
                        <span>{formatPrice(unit)}</span>
                      </div>
                      <label className="shop-cart-dock__qty">
                        <span className="visually-hidden">Quantidade</span>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => setQuantity(line.product.id, Number(e.target.value || 1))}
                        />
                      </label>
                      <strong className="shop-cart-dock__line-total">{formatPrice(unit * line.quantity)}</strong>
                      <button
                        type="button"
                        className="shop-cart-dock__remove"
                        aria-label={`Remover ${line.product.name}`}
                        onClick={() => remove(line.product.id)}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="shop-cart-dock__foot">
            <div className="shop-cart-dock__total">
              <span>Total</span>
              <strong>{formatPrice(totalCents)}</strong>
            </div>
            <button
              type="button"
              className="btn-primary cart-desk__submit"
              disabled={count === 0}
              onClick={() => navigate(user ? "/checkout" : "/acesso", { state: { from: "/checkout" } })}
            >
              {user ? "Finalizar compra" : "Entrar para comprar"}
            </button>
          </footer>
        </div>
      </aside>
    </div>
  );
}
