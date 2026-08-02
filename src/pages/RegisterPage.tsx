import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageCard, PageShell } from "../components/PageShell";
import { SITE } from "../lib/site";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/assinar";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/assinar", { replace: true, state: { needSubscription: true, from } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      narrow
      eyebrow="GB Dental · Cadastro"
      title="Criar conta"
      lead="Informe só o essencial para começar na GB Dental."
    >
      <PageCard>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome completo
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Senha (mín. 6 caracteres)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
            {loading ? "Criando…" : "Criar conta"}
          </button>
        </form>
        <p className="auth-card__footer">
          Já tem conta? <Link to="/acesso" state={{ from }}>Entrar</Link>
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
