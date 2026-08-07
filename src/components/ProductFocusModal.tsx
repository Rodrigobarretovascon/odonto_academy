import { useEffect, useId, useRef } from "react";
import { formatPrice, type Product } from "../lib/api";
import { ProductImageCarousel, productImageSlides } from "./ProductImageCarousel";

type Props = {
  product: Product;
  inCart: boolean;
  quantity: number;
  onClose: () => void;
  onAdd: () => void;
};

export function ProductFocusModal({ product, inCart, quantity, onClose, onAdd }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const out = product.stock_qty != null && product.stock_qty <= 0;
  const effective = product.effective_price_cents ?? product.price_cents;
  const onPromo = effective < product.price_cents;
  const chars = product.characteristics ?? [];
  const apps = product.applications ?? [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="product-focus" role="presentation">
      <button type="button" className="product-focus__scrim" aria-label="Fechar" onClick={onClose} />
      <div
        className="product-focus__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button ref={closeRef} type="button" className="product-focus__close" onClick={onClose} aria-label="Fechar">
          ×
        </button>

        <div className="product-focus__media">
          <ProductImageCarousel
            images={productImageSlides(product)}
            alt={product.name}
            autoplayMs={4200}
            className="product-focus__carousel"
          />
          {product.badge && <span className="product-focus__badge">{product.badge}</span>}
        </div>

        <div className="product-focus__info">
          {product.subtitle && <p className="product-focus__sub">{product.subtitle}</p>}
          <h2 id={titleId} className="product-focus__title">
            {product.name}
          </h2>

          <div className="product-focus__price-row">
            <span className="product-focus__price">
              {onPromo && <s>{formatPrice(product.price_cents)}</s>}
              {formatPrice(effective)}
            </span>
            {product.stock_qty != null && (
              <span className={`product-focus__stock${out ? " is-out" : ""}`}>
                {out ? "Esgotado" : `${product.stock_qty} em estoque`}
              </span>
            )}
          </div>

          {product.description && <p className="product-focus__desc">{product.description}</p>}

          {chars.length > 0 && (
            <section className="product-focus__section" aria-labelledby={`${titleId}-chars`}>
              <h3 id={`${titleId}-chars`}>Características</h3>
              <ul className="product-focus__chips">
                {chars.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          {apps.length > 0 && (
            <section className="product-focus__section" aria-labelledby={`${titleId}-apps`}>
              <h3 id={`${titleId}-apps`}>Aplicações</h3>
              <ul className="product-focus__list">
                {apps.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="product-focus__actions">
            <button type="button" className="btn-primary" disabled={out} onClick={onAdd}>
              {out ? "Indisponível" : inCart ? `Adicionar +1 (já tem ${quantity})` : "Adicionar ao carrinho"}
            </button>
            <button type="button" className="btn-outline" onClick={onClose}>
              Continuar olhando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
