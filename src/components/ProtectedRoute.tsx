import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ requireAccess = false, admin = false }: { requireAccess?: boolean; admin?: boolean }) {
  const { user, hasAccess, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner" />
        <p>Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireAccess && !hasAccess && user.role !== "admin") {
    return <Navigate to="/loja" state={{ needSubscription: true }} replace />;
  }

  return <Outlet />;
}
