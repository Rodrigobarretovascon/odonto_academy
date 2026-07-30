import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const data = await api<{ message: string; resetTokenDev?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(
        data.resetTokenDev
          ? `${data.message} (dev) Token: ${data.resetTokenDev}`
          : data.message,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail da sua conta GB Dental. Enviaremos um link de redefinição.</p>
        <form onSubmit={submit} className="auth-form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          {msg && <p className="form-success">{msg}</p>}
          <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </button>
        </form>
        <p className="auth-card__footer">
          <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
