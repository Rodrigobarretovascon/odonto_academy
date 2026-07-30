import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoading } from "./ToothMascot";

export function ProtectedRoute({ requireAccess = false, admin = false }: { requireAccess?: boolean; admin?: boolean }) {
  const { user, hasAccess, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoading message="Carregando sua conta…" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireAccess && !hasAccess && user.role !== "admin") {
    return <Navigate to="/assinar" state={{ needSubscription: true, from: location.pathname }} replace />;
  }

  return <Outlet />;
}
