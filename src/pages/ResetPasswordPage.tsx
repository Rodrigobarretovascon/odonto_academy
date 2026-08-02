import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { PageCard, PageShell } from "../components/PageShell";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = params.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      navigate("/acesso", { replace: true, state: { resetOk: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      narrow
      eyebrow="GB Dental · Acesso"
      title="Nova senha"
      lead="Defina uma nova senha para acessar o GB Dental."
    >
      <PageCard>
        <form onSubmit={submit} className="auth-form">
          <label>
            Token
            <input value={token} onChange={(e) => setToken(e.target.value)} required />
          </label>
          <label>
            Nova senha
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
            {loading ? "Salvando…" : "Salvar senha"}
          </button>
        </form>
        <p className="auth-card__footer">
          <Link to="/acesso">Voltar ao acesso</Link>
        </p>
      </PageCard>
    </PageShell>
  );
}
