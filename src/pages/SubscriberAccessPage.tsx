import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageCard, PageShell } from "../components/PageShell";
import { PageLoading } from "../components/ToothMascot";
import { SITE } from "../lib/site";

type AccessState = {
  from?: string;
  needSubscription?: boolean;
};

export function SubscriberAccessPage() {
  const { user, hasAccess, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as AccessState | null) ?? {};
  const from = state.from && state.from !== "/acesso" ? state.from : "/app";

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canAccess = Boolean(hasAccess || user?.role === "admin");

  useEffect(() => {
    if (!loading && user && canAccess) {
      navigate(from, { replace: true });
    }
  }, [loading, user, canAccess, from, navigate]);

  if (loading) {
    return <PageLoading message="Verificando seu acesso…" />;
  }

  if (user && canAccess) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.hasAccess || result.user.role === "admin") {
        navigate(from, { replace: true });
      } else {
        navigate("/assinar", { replace: true, state: { needSubscription: true, from } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user && showLogin) {
    return (
      <PageShell
        narrow
        eyebrow="GB Dental · Acesso"
        title="Entrar"
        lead="Use o e-mail e a senha da sua conta GB Dental."
        actions={
          <button type="button" className="btn-outline" onClick={() => setShowLogin(false)}>
            ← Voltar
          </button>
        }
      >
        <PageCard>
          <form onSubmit={handleLogin} className="auth-form">
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
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
            <button type="submit" className="btn-primary btn-primary--block" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <p className="auth-card__footer">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
          </p>
          <p className="auth-card__footer">
            Ainda não possui uma conta?{" "}
            <Link to="/cadastro" state={{ from }}>
              Cadastre-se
            </Link>
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

  return (
    <PageShell
      narrow
      eyebrow="GB Dental · Área exclusiva"
      title="Conteúdo exclusivo para assinantes"
      lead="Você ainda não entrou na sua conta ou não possui uma assinatura ativa. Entre para verificar seu acesso ou assine a plataforma para aproveitar todos os conteúdos da GB Dental."
      actions={
        <>
          {!user && (
            <button type="button" className="btn-primary btn-primary--lg" onClick={() => setShowLogin(true)}>
              Entrar na minha conta
            </button>
          )}
          <Link to="/assinar" state={{ needSubscription: true, from }} className="btn-outline btn-outline--lg">
            Quero assinar
          </Link>
        </>
      }
      panelBody={
        <>
          {!user && (
            <p className="access-page__register">
              Ainda não possui uma conta?{" "}
              <Link to="/cadastro" state={{ from }}>
                Cadastre-se
              </Link>
            </p>
          )}
          {user && !canAccess && (
            <p className="access-page__note">
              Você está conectada como <strong>{user.email}</strong>, mas ainda sem assinatura ativa.{" "}
              <Link to="/assinar" state={{ needSubscription: true, from }}>
                Ver planos
              </Link>
              {" · "}
              <button type="button" className="access-page__text-btn" onClick={() => logout()}>
                Trocar de conta
              </button>
            </p>
          )}
        </>
      }
      footer={
        <p className="page-shell__support">
          Ficou com alguma dúvida? Entre em contato pelo WhatsApp:{" "}
          <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {SITE.whatsappDisplay}
          </a>
        </p>
      }
    />
  );
}
