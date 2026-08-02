import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoading } from "../components/ToothMascot";

/** Mantém a rota /como-funciona e leva à seção contínua da home. */
export function HowItWorksPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/#como-funciona", { replace: true });
  }, [navigate]);

  return <PageLoading message="Abrindo Como funciona…" />;
}
