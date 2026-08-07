import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { PublicLayout } from "./layouts/PublicLayout";
import { MemberLayout } from "./layouts/MemberLayout";
import { LandingPage } from "./pages/LandingPage";
import { ShopCartPage } from "./pages/ShopCartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MemberHomePage } from "./pages/MemberHomePage";
import { SculpturePage } from "./pages/SculpturePage";
import { AnatomyPage } from "./pages/AnatomyPage";
import { AiChatPage } from "./pages/AiChatPage";
import { NewsPage } from "./pages/NewsPage";
import { AdminPage } from "./pages/AdminPage";
import { SubscribePage } from "./pages/SubscribePage";
import { AboutPage } from "./pages/AboutPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { ResumosPage } from "./pages/ResumosPage";
import { Viewer3DPage } from "./pages/Viewer3DPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PageLoading } from "./components/ToothMascot";
import { SubscriberAccessPage } from "./pages/SubscriberAccessPage";

function RedirectImmersiveToClassic() {
  const { dente = "11" } = useParams();
  return <Navigate to={`/app/escultura/${dente}`} replace />;
}

function AiEntry() {
  const { user, hasAccess, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (user && (hasAccess || user.role === "admin")) {
    return <Navigate to="/app/ia" replace />;
  }
  return <Navigate to="/acesso" state={{ from: "/app/ia" }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="o-que-somos" element={<AboutPage />} />
              <Route path="como-funciona" element={<HowItWorksPage />} />
              <Route path="recursos" element={<ResourcesPage />} />
              <Route path="assinar" element={<SubscribePage />} />
              <Route path="acesso" element={<SubscriberAccessPage />} />
              <Route path="ia" element={<AiEntry />} />
              <Route path="loja" element={<ShopCartPage />} />
              <Route path="carrinho" element={<Navigate to="/loja" replace />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="cadastro" element={<RegisterPage />} />
              <Route path="recuperar-senha" element={<ForgotPasswordPage />} />
              <Route path="redefinir-senha" element={<ResetPasswordPage />} />
              <Route element={<ProtectedRoute requireAccess />}>
                <Route path="perguntas" element={<QuestionsPage />} />
                <Route path="resumos" element={<ResumosPage />} />
              </Route>
              <Route element={<ProtectedRoute admin />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="app" element={<MemberLayout />}>
                <Route index element={<MemberHomePage />} />

                <Route element={<ProtectedRoute requireAccess />}>
                  <Route path="resumos" element={<ResumosPage />} />
                  <Route path="escultura" element={<Navigate to="/app/escultura/11" replace />} />
                  <Route path="escultura/:dente/imersivo" element={<RedirectImmersiveToClassic />} />
                  <Route path="escultura/:dente" element={<SculpturePage />} />
                  <Route path="anatomia" element={<AnatomyPage />} />
                  <Route path="visualizador-3d" element={<Viewer3DPage />} />
                  <Route path="ia" element={<AiChatPage />} />
                  <Route path="novidades" element={<NewsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
