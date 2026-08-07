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
        {detailed && <p className="product-card__desc">{product.description}</p>}
        {product.characteristics && product.characteristics.length > 0 && (
          <ul className="product-card__chips">
            {product.characteristics.slice(0, 4).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <div className="product-card__meta">
          {product.access_days > 0 && (
            <span className="product-card__tag">{product.access_days} dias de acesso</span>
          )}
          {product.stock_qty != null && (
            <span className="product-card__tag">
              {outOfStock ? "Esgotado" : `${product.stock_qty} em estoque`}
            </span>
          )}
          <span className="product-card__price">
            {onPromo && <s className="product-card__price-old">{formatPrice(product.price_cents)}</s>}
            {formatPrice(effective)}
          </span>
        </div>
        <button
          type="button"
          className="btn-primary btn-primary--block"
          onClick={() => add(product)}
          disabled={outOfStock}
        >
          {outOfStock ? "Indisponível" : inCart ? "Adicionar +1" : "Adicionar ao carrinho"}
        </button>
        <Link to="/loja" className="product-card__link">
          Ver carrinho →
        </Link>
      </div>
    </article>
  );
}
