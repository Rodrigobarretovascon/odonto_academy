import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice, type Product } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { cartLineUnit, useCart } from "../context/CartContext";
import { InCartBadge } from "../components/InCartBadge";

/** Carrinho da loja (cliente) — sincronizado com o badge do header */
export function ShopCartPage() {
  const { user } = useAuth();
  const { items, add, remove, setQuantity, clear, has, quantityOf, totalCents, count } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [flashId, setFlashId] = useState<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  function onCarouselAdd(product: Product) {
    if (product.stock_qty != null && product.stock_qty <= 0) return;
    add(product);
    setFlashId(product.id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 900);
  }

  function scrollCarousel(dir: -1 | 1) {
    carouselRef.current?.scrollBy({ top: dir * 160, left: dir * 180, behavior: "smooth" });
  }

  return (
    <div className="cart-desk cart-desk--shop">
      <div className="cart-desk__layout">
        <div className="cart-desk__main">
          <header className="cart-desk__head">
            <div className="cart-desk__head-main">
              <span className="cart-desk__title">Carrinho</span>
              <span className="admin-badge is-on">
                {count} {count === 1 ? "item" : "itens"}
              </span>
            </div>
            <div className="cart-desk__head-actions">
              <button type="button" className="btn-outline btn-outline--sm" onClick={clear} disabled={!count}>
                Limpar
              </button>
            </div>
          </header>

          <section className="cart-desk__customer cart-desk__buyer">
            {user ? (
              <p className="cart-desk__buyer-line">
                Comprador: <strong>{user.name}</strong>
                <span className="cart-desk__meta-sep" aria-hidden="true" />
                <span>{user.email}</span>
              </p>
            ) : (
              <p className="cart-desk__buyer-line">
                Entre na sua conta para finalizar a compra.{" "}
                <Link to="/login" state={{ from: "/loja" }}>
                  Entrar
                </Link>{" "}
                ou{" "}
                <Link to="/cadastro" state={{ from: "/loja" }}>
                  criar conta
                </Link>
                .
              </p>
            )}
          </section>

          <section className="cart-desk__items">
            {items.length === 0 ? (
              <p className="admin-muted cart-desk__empty">
                Carrinho vazio. Clique em um produto à direita para adicionar.
              </p>
            ) : (
              <div className="cart-desk__lines">
                <div className="cart-desk__line cart-desk__line--head" aria-hidden="true">
                  <span>Produto</span>
                  <span>Qtd</span>
                  <span>Preço un.</span>
                  <span>Total</span>
                  <span />
                </div>
                {items.map((line) => {
                  const unit = cartLineUnit(line);
                  return (
                    <article key={line.product.id} className="cart-desk__line">
                      <div className="cart-desk__line-product">
                        <img src={line.product.image_url} alt="" />
                        <strong>{line.product.name}</strong>
                      </div>
                      <label className="cart-desk__line-qty">
                        <span className="order-line__label">Qtd</span>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => setQuantity(line.product.id, Number(e.target.value || 1))}
                        />
                      </label>
                      <div className="cart-desk__line-price">
                        <span className="order-line__label">Preço un.</span>
                        <strong>{formatPrice(unit)}</strong>
                      </div>
                      <div className="cart-desk__line-total">
                        <span className="order-line__label">Total</span>
                        <strong>{formatPrice(unit * line.quantity)}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn-outline btn-outline--sm"
                        onClick={() => remove(line.product.id)}
                      >
                        Remover
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="cart-desk__foot">
            <div className="cart-desk__checkout-bar">
              <dl className="order-desk__totals order-desk__totals--inline">
                <div className="is-total">
                  <dt>Total</dt>
                  <dd>{formatPrice(totalCents)}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="btn-primary cart-desk__submit"
                disabled={count === 0}
                onClick={() => navigate(user ? "/checkout" : "/login", { state: { from: "/checkout" } })}
              >
                {user ? "Finalizar compra" : "Entrar para comprar"}
              </button>
            </div>
          </footer>
        </div>

        <aside className="cart-desk__rail" aria-label="Produtos">
          <div className="cart-desk__rail-head">
            <p className="cart-desk__rail-title">Produtos</p>
            <p className="cart-desk__rail-hint">Clique para adicionar (+1)</p>
            <div className="cart-desk__rail-nav">
              <button type="button" className="btn-outline btn-outline--sm" onClick={() => scrollCarousel(-1)} aria-label="Anterior">
                ‹
              </button>
              <button type="button" className="btn-outline btn-outline--sm" onClick={() => scrollCarousel(1)} aria-label="Próximo">
                ›
              </button>
            </div>
          </div>
          <div className="cart-desk__carousel" ref={carouselRef}>
            {products.map((p) => {
              const inCart = has(p.id);
              const out = p.stock_qty != null && p.stock_qty <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cart-desk__tile${inCart ? " is-in-cart" : ""}${flashId === p.id ? " is-flash" : ""}${out ? " is-out" : ""}`}
                  onClick={() => onCarouselAdd(p)}
                  disabled={out}
                  title={out ? "Esgotado" : inCart ? "Adicionar +1" : "Adicionar ao carrinho"}
                >
                  <span className="cart-desk__tile-img">
                    {inCart && <InCartBadge quantity={quantityOf(p.id)} />}
                    <img src={p.image_url} alt="" />
                  </span>
                  <span className="cart-desk__tile-name">{p.name}</span>
                  <span className="cart-desk__tile-price">
                    {formatPrice(p.effective_price_cents ?? p.price_cents)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
