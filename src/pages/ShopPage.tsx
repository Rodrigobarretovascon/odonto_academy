import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, type Product } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const location = useLocation();
  const needSub = (location.state as { needSubscription?: boolean })?.needSubscription;

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  return (
    <div className="shop-page">
      {needSub && (
        <div className="alert-banner alert-banner--warn">
          Sua assinatura expirou ou você ainda não tem acesso. Escolha um plano abaixo.
        </div>
      )}
      <header className="page-header">
        <h1>Loja</h1>
        <p>Materiais e assinatura do GB Dental</p>
      </header>
      <div className="product-grid product-grid--shop">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} detailed />
        ))}
      </div>
    </div>
  );
}
