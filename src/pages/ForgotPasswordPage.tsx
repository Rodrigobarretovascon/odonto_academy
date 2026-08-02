import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PageCard, PageShell } from "../components/PageShell";
import { SITE } from "../lib/site";

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
    <PageShell
      narrow
      eyebrow="GB Dental · Acesso"
      title="Recuperar senha"
      lead="Informe o e-mail da sua conta. Enviaremos um link de redefinição."
    >
      <PageCard>
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
          <Link to="/acesso">Voltar ao acesso</Link>
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
