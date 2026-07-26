import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, formatPrice } from "../lib/api";

interface Dashboard {
  revenueCents: number;
  ordersCount: number;
  activeSubscribers: number;
  recentOrders: Array<{
    id: number;
    total_cents: number;
    created_at: string;
    customer: string;
    email: string;
    products: string;
  }>;
  monthlyRevenue: Array<{ month: string; total: string }>;
}

export function AdminPage() {
  const { token } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Dashboard>("/admin/dashboard", {}, token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <div className="page-loading"><div className="page-loading__spinner" /></div>;

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Administração</h1>
        <p>Vendas, lucros e assinaturas</p>
      </header>
      <div className="admin-stats">
        <article className="stat-card stat-card--gold">
          <span>Receita total</span>
          <strong>{formatPrice(data.revenueCents)}</strong>
        </article>
        <article className="stat-card">
          <span>Pedidos</span>
          <strong>{data.ordersCount}</strong>
        </article>
        <article className="stat-card">
          <span>Assinantes ativos</span>
          <strong>{data.activeSubscribers}</strong>
        </article>
      </div>
      {data.monthlyRevenue.length > 0 && (
        <section className="admin-section">
          <h2>Receita mensal</h2>
          <ul className="admin-monthly">
            {data.monthlyRevenue.map((m) => (
              <li key={m.month}>
                <span>{m.month}</span>
                <strong>{formatPrice(Number(m.total))}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="admin-section">
        <h2>Pedidos recentes</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer ?? o.email ?? "—"}</td>
                  <td>{o.products}</td>
                  <td>{formatPrice(o.total_cents)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
