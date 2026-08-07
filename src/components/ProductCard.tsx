import { Link } from "react-router-dom";
import { formatPrice, type Product } from "../lib/api";
import { useCart } from "../context/CartContext";
import { InCartBadge } from "./InCartBadge";

interface ProductCardProps {
  product: Product;
  detailed?: boolean;
}

export function ProductCard({ product, detailed }: ProductCardProps) {
  const { add, has, quantityOf } = useCart();
  const effective = product.effective_price_cents ?? product.price_cents;
  const onPromo = effective < product.price_cents;
  const outOfStock = product.stock_qty != null && product.stock_qty <= 0;
  const inCart = has(product.id);
  const highlights = product.characteristics?.slice(0, 3) ?? [];

  return (
    <article className={`product-card${detailed ? " product-card--detailed" : ""}${inCart ? " is-in-cart" : ""}`}>
      <div className="product-card__image-wrap">
        {inCart && <InCartBadge quantity={quantityOf(product.id)} />}
        <img src={product.image_url} alt="" className="product-card__image" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__subtitle">{product.subtitle}</p>
        <h3 className="product-card__title">{product.name}</h3>

        {detailed && product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}

        {detailed && highlights.length > 0 && (
          <p className="product-card__highlights">{highlights.join(" · ")}</p>
        )}

        <div className="product-card__footer">
          <div className="product-card__pricing">
            <span className="product-card__price">
              {onPromo && <s className="product-card__price-old">{formatPrice(product.price_cents)}</s>}
              {formatPrice(effective)}
            </span>
            {product.access_days > 0 && (
              <span className="product-card__note">{product.access_days} dias de acesso</span>
            )}
            {product.stock_qty != null && (
              <span className={`product-card__note${outOfStock ? " is-out" : ""}`}>
                {outOfStock ? "Esgotado" : "Em estoque"}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-primary btn-primary--block"
            onClick={() => add(product)}
            disabled={outOfStock}
          >
            {outOfStock ? "Indisponível" : inCart ? "Adicionar +1" : "Adicionar ao carrinho"}
          </button>

          {inCart && (
            <Link to="/loja" className="product-card__link">
              Ver carrinho →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
