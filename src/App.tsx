import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { MemberLayout } from "./layouts/MemberLayout";
import { LandingPage } from "./pages/LandingPage";
import { ShopPage } from "./pages/ShopPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MemberHomePage } from "./pages/MemberHomePage";
import { SculpturePage } from "./pages/SculpturePage";
import { AnatomyPage } from "./pages/AnatomyPage";
import { AiChatPage } from "./pages/AiChatPage";
import { NewsPage } from "./pages/NewsPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="loja" element={<ShopPage />} />
              <Route path="carrinho" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="cadastro" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="app" element={<MemberLayout />}>
                <Route index element={<MemberHomePage />} />
                <Route path="escultura" element={<Navigate to="/app/escultura/13" replace />} />
                <Route path="escultura/:dente" element={<SculpturePage />} />

                <Route element={<ProtectedRoute requireAccess />}>
                  <Route path="anatomia" element={<AnatomyPage />} />
                  <Route path="ia" element={<AiChatPage />} />
                  <Route path="novidades" element={<NewsPage />} />
                </Route>
              </Route>
            </Route>

            <Route element={<ProtectedRoute admin />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
