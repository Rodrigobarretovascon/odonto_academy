/** Ícone de carrinho no canto da imagem — produtos já no carrinho */
export function InCartBadge({ quantity }: { quantity?: number }) {
  return (
    <span className="in-cart-badge" title={quantity ? `${quantity} no carrinho` : "No carrinho"} aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.6L5 4H2" />
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </svg>
      {quantity != null && quantity > 1 && <span className="in-cart-badge__qty">{quantity}</span>}
    </span>
  );
}
