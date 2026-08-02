import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/api";
import { PageShell } from "../components/PageShell";

export function CartPage() {
  const { items, remove, totalCents, count } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <PageShell
        narrow
        eyebrow="GB Dental · Loja"
        title="Carrinho"
        lead="Seu carrinho está vazio."
        actions={
          <Link to="/loja" className="btn-primary btn-primary--lg">
            Ir à loja
          </Link>
        }
      />
    );
  }

  return (
    <PageShell eyebrow="GB Dental · Loja" title={`Carrinho (${count})`} lead="Revise os itens antes de finalizar.">
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
    </PageShell>
  );
}
