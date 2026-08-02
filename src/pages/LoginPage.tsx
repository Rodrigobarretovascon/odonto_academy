import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageCard, PageShell } from "../components/PageShell";
import { SITE } from "../lib/site";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.hasAccess || result.user.role === "admin") {
        navigate(from, { replace: true });
      } else {
        navigate("/assinar", { replace: true, state: { needSubscription: true, from } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      narrow
      eyebrow="GB Dental · Acesso"
      title="Entrar"
      lead="Acesse sua conta do GB Dental para continuar."
    >
      <PageCard>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="auth-card__footer">
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
        </p>
        <p className="auth-card__footer">
          Não tem conta? <Link to="/cadastro" state={{ from }}>Cadastre-se</Link>
        </p>
      </PageCard>
      <p className="page-shell__support">
        Dúvidas? WhatsApp{" "}
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
          {SITE.whatsappDisplay}
        </a>
      </p>
    </PageShell>
  );
}
