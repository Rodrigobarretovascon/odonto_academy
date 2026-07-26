import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api, formatPrice } from "../lib/api";

export function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await api(
        "/orders/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
            paymentMethod: "demo",
          }),
        },
        token,
      );
      clear();
      setSuccess(true);
      setTimeout(() => navigate("/app"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no checkout");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="checkout-page">
        <p>Carrinho vazio.</p>
        <Link to="/loja">Voltar à loja</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="checkout-page checkout-page--success">
        <div className="success-card">
          <span className="success-card__icon">✓</span>
          <h1>Compra confirmada!</h1>
          <p>Redirecionando para sua área exclusiva…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Finalizar compra</h1>
      <div className="checkout-grid">
        <section className="checkout-summary">
          <h2>Resumo</h2>
          <ul>
            {items.map(({ product, quantity }) => (
              <li key={product.id}>
                {product.name} ×{quantity} — {formatPrice(product.price_cents * quantity)}
              </li>
            ))}
          </ul>
          <p className="checkout-summary__total">
            Total: <strong>{formatPrice(totalCents)}</strong>
          </p>
          <p className="checkout-summary__note">
            Modo demonstração — pagamento simulado. Integração com gateway em produção.
          </p>
        </section>

        {!user ? (
          <section className="checkout-auth">
            <h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2>
            <p>Crie sua conta para receber o acesso após a compra.</p>
            <div className="tab-switch">
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
                Entrar
              </button>
              <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
                Cadastrar
              </button>
            </div>
            <form onSubmit={handleAuth} className="auth-form">
              {mode === "register" && (
                <label>
                  Nome
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
              )}
              <label>
                E-mail
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                Senha
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </section>
        ) : (
          <section className="checkout-pay">
            <h2>Pagamento</h2>
            <p>Olá, <strong>{user.name}</strong>!</p>
            {error && <p className="form-error">{error}</p>}
            <button type="button" className="btn-primary btn-primary--lg" onClick={handleCheckout} disabled={loading}>
              {loading ? "Processando…" : `Confirmar · ${formatPrice(totalCents)}`}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
