import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, type Product } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { PageShell } from "../components/PageShell";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const location = useLocation();
  const needSub = (location.state as { needSubscription?: boolean })?.needSubscription;

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(console.error);
  }, []);

  return (
    <PageShell
      eyebrow="GB Dental · Loja"
      title="Loja"
      lead="Materiais e planos de assinatura do GB Dental — aberta a todos."
      actions={
        <>
          <Link to="/assinar" className="btn-primary btn-primary--lg">
            Ver assinatura
          </Link>
          <Link to="/recursos" className="btn-outline btn-outline--lg">
            Ver recursos
          </Link>
        </>
      }
    >
      {needSub && (
        <div className="alert-banner alert-banner--warn">
          Sua assinatura expirou ou você ainda não tem acesso. Escolha um plano abaixo.
        </div>
      )}
      <div className="product-grid product-grid--shop">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} detailed />
        ))}
      </div>
    </PageShell>
  );
}
