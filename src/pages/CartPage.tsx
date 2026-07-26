import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/api";

export function CartPage() {
  const { items, remove, totalCents, count } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <div className="cart-page cart-page--empty">
        <h1>Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <Link to="/loja" className="btn-primary">
          Ir à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Carrinho ({count})</h1>
      <ul className="cart-list">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="cart-item">
            <img src={product.image_url} alt="" className="cart-item__img" />
            <div className="cart-item__info">
              <strong>{product.name}</strong>
              <span>{product.subtitle}</span>
            </div>
            <span className="cart-item__qty">×{quantity}</span>
            <span className="cart-item__price">{formatPrice(product.price_cents * quantity)}</span>
            <button type="button" className="cart-item__remove" onClick={() => remove(product.id)} aria-label="Remover">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div className="cart-summary__total">
          <span>Total</span>
          <strong>{formatPrice(totalCents)}</strong>
        </div>
        <button type="button" className="btn-primary btn-primary--lg" onClick={() => navigate("/checkout")}>
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
