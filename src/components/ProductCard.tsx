import { Link } from "react-router-dom";
import { formatPrice, type Product } from "../lib/api";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  detailed?: boolean;
}

export function ProductCard({ product, detailed }: ProductCardProps) {
  const { add } = useCart();

  return (
    <article className={`product-card${detailed ? " product-card--detailed" : ""}`}>
      <div className="product-card__image-wrap">
        <img src={product.image_url} alt="" className="product-card__image" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__subtitle">{product.subtitle}</p>
        <h3 className="product-card__title">{product.name}</h3>
        {detailed && <p className="product-card__desc">{product.description}</p>}
        <div className="product-card__meta">
          {product.access_days > 0 && (
            <span className="product-card__tag">{product.access_days} dias de acesso</span>
          )}
          <span className="product-card__price">{formatPrice(product.price_cents)}</span>
        </div>
        <button type="button" className="btn-primary btn-primary--block" onClick={() => add(product)}>
          Adicionar ao carrinho
        </button>
        <Link to="/carrinho" className="product-card__link">
          Ver carrinho →
        </Link>
      </div>
    </article>
  );
}
