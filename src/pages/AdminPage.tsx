import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, formatPrice } from "../lib/api";
import { FieldLabel, reaisToCents } from "./admin/adminShared";
import { VolumePricesPanel } from "./admin/VolumePricesPanel";
import { InventoryPanel } from "./admin/InventoryPanel";
import { OrdersPanel } from "./admin/OrdersPanel";
import { CouponsPanel } from "./admin/CouponsPanel";
import { CustomersPanel } from "./admin/CustomersPanel";
import { BannersPanel } from "./admin/BannersPanel";

type Tab = "dashboard" | "products" | "volume" | "inventory" | "customers" | "orders" | "coupons" | "banners";

interface AdminProduct {
  id: number;
  code: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  promo_price_cents: number | null;
  type: string;
  access_days: number;
  image_url: string | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
  stock_qty: number | null;
  characteristics: string[];
  applications: string[];
}

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
    channel: string;
  }>;
  monthlyRevenue: Array<{ month: string; total: string }>;
  lowStock: Array<{ id: number; name: string; stock_qty: number }>;
}

const emptyForm = {
  code: "",
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  price_cents: "",
  promo_price_cents: "",
  type: "physical",
  access_days: "0",
  badge: "",
  stock_qty: "",
  characteristics: "",
  applications: "",
  featured: true,
  active: true,
};

function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  function notify(success: string, err = "") {
    setOk(success);
    setError(err);
  }

  async function loadDashboard() {
    setDashboard(await api<Dashboard>("/admin/dashboard", {}, token));
  }

  async function loadProducts() {
    setProducts(await api<AdminProduct[]>("/admin/products", {}, token));
  }

  useEffect(() => {
    setError("");
    setOk("");
    const run = async () => {
      try {
        if (tab === "dashboard") await loadDashboard();
        if (tab === "products" || tab === "volume" || tab === "orders") await loadProducts();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar");
      }
    };
    void run();
  }, [tab, token]);

  function startEdit(p: AdminProduct) {
    setEditingId(p.id);
    setForm({
      code: p.code ?? "",
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle ?? "",
      description: p.description ?? "",
      price_cents: String((p.price_cents / 100).toFixed(2)),
      promo_price_cents: p.promo_price_cents != null ? String((p.promo_price_cents / 100).toFixed(2)) : "",
      type: p.type,
      access_days: String(p.access_days),
      badge: p.badge ?? "",
      stock_qty: p.stock_qty == null ? "" : String(p.stock_qty),
      characteristics: (p.characteristics ?? []).join(", "),
      applications: (p.applications ?? []).join(", "),
      featured: p.featured,
      active: p.active,
    });
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      const payload = {
        name: form.name,
        subtitle: form.subtitle,
        description: form.description,
        price_cents: reaisToCents(form.price_cents),
        promo_price_cents: form.promo_price_cents ? reaisToCents(form.promo_price_cents) : null,
        type: form.type,
        access_days: Number(form.access_days || 0),
        badge: form.badge || null,
        stock_qty: form.stock_qty === "" ? null : Number(form.stock_qty),
        characteristics: splitList(form.characteristics),
        applications: splitList(form.applications),
        featured: form.featured,
        active: form.active,
      };
      if (editingId) {
        await api(`/admin/products/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        setOk("Produto atualizado");
      } else {
        await api("/admin/products", { method: "POST", body: JSON.stringify(payload) }, token);
        setOk("Produto cadastrado com código gerado automaticamente");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function uploadPhoto(productId: number, file: File) {
    const body = new FormData();
    body.append("photo", file);
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? "/api"}/admin/products/${productId}/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Falha no upload");
    await loadProducts();
    setOk("Foto atualizada");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Painel" },
    { id: "products", label: "Produtos" },
    { id: "volume", label: "Preço volume" },
    { id: "inventory", label: "Inventário" },
    { id: "customers", label: "Clientes" },
    { id: "orders", label: "Carrinho (PDV)" },
    { id: "coupons", label: "Cupons" },
    { id: "banners", label: "Banners" },
  ];

  const productLite = products.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price_cents: p.price_cents,
    stock_qty: p.stock_qty,
  }));

  return (
    <div className="admin-page">
      <header className="page-header admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Área restrita · Admin</p>
          <h1>Administração GB Dental</h1>
          <p>Produtos, volume, inventário, clientes, PDV, cupons e banners</p>
        </div>
        <div className="admin-page__nav">
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <Link to="/app" className="btn-outline">
            GB Dental
          </Link>
          <Link to="/" className="btn-primary">
            Início
          </Link>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Seções admin">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tabs__btn${tab === t.id ? " is-on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <p className="form-error">{error}</p>}
      {ok && <p className="form-success">{ok}</p>}

      {tab === "dashboard" && !dashboard && !error && (
        <div className="page-loading">
          <div className="page-loading__spinner" />
        </div>
      )}

      {tab === "dashboard" && dashboard && (
        <>
          <div className="admin-stats">
            <article className="stat-card stat-card--gold">
              <span>Receita total</span>
              <strong>{formatPrice(dashboard.revenueCents)}</strong>
            </article>
            <article className="stat-card">
              <span>Carrinho / vendas</span>
              <strong>{dashboard.ordersCount}</strong>
            </article>
            <article className="stat-card">
              <span>Assinantes ativos</span>
              <strong>{dashboard.activeSubscribers}</strong>
            </article>
          </div>
          {dashboard.lowStock.length > 0 && (
            <section className="admin-section">
              <h2>Estoque baixo</h2>
              <ul className="admin-monthly">
                {dashboard.lowStock.map((p) => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    <strong>{p.stock_qty} un.</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="admin-section">
            <h2>Vendas recentes</h2>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Canal</th>
                    <th>Produtos</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customer ?? o.email ?? "—"}</td>
                      <td>{o.channel}</td>
                      <td>{o.products}</td>
                      <td>{formatPrice(o.total_cents)}</td>
                      <td>{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === "products" && (
        <div className="admin-grid">
          <section className="admin-section">
            <h2>{editingId ? "Editar produto" : "Cadastrar produto"}</h2>
            <p className="admin-muted">
              Produto, preço unitário/promo e estoque inicial no mesmo formulário. Preço por volume e inventário ficam
              nas abas dedicadas.
            </p>
            <form className="admin-form" onSubmit={saveProduct}>
              <FieldLabel
                label="Código"
                tip="Código único do produto (ex.: GB-00001). Gerado automaticamente ao criar; não é editável."
              >
                <input value={editingId ? form.code : "Gerado ao salvar"} readOnly disabled />
              </FieldLabel>
              <FieldLabel label="Nome" tip="Nome comercial exibido na loja, nos pedidos e no catálogo.">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </FieldLabel>
              <FieldLabel
                label="Subtítulo"
                tip="Frase curta abaixo do nome no card do produto (ex.: kit completo, edição especial)."
              >
                <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </FieldLabel>
              <FieldLabel
                label="Descrição"
                tip="Texto completo da página do produto: detalhes, conteúdo e informações para o cliente."
              >
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  required
                />
              </FieldLabel>
              <div className="admin-form__row">
                <FieldLabel
                  label="Preço unitário (R$)"
                  tip="Preço de tabela por unidade, usado quando não há promoção nem faixa de volume."
                >
                  <input
                    value={form.price_cents}
                    onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
                    required
                  />
                </FieldLabel>
                <FieldLabel
                  label="Preço promocional (R$)"
                  tip="Preço em promoção exibido na loja. Deve ser menor ou igual ao unitário. Deixe vazio se não houver promo."
                >
                  <input
                    value={form.promo_price_cents}
                    onChange={(e) => setForm({ ...form, promo_price_cents: e.target.value })}
                  />
                </FieldLabel>
              </div>
              <div className="admin-form__row">
                <FieldLabel
                  label="Estoque (unidades)"
                  tip="Saldo inicial ao criar o produto. Deixe vazio para não controlar estoque. Depois use a aba Inventário."
                >
                  <input
                    value={form.stock_qty}
                    onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                  />
                </FieldLabel>
                <FieldLabel
                  label="Dias de acesso"
                  tip="Se maior que zero, a compra libera o conteúdo de assinante por esse número de dias."
                >
                  <input
                    value={form.access_days}
                    onChange={(e) => setForm({ ...form, access_days: e.target.value })}
                  />
                </FieldLabel>
              </div>
              <div className="admin-form__row">
                <FieldLabel
                  label="Tipo"
                  tip="Físico (envio/estoque), assinatura ou digital (acesso online sem frete físico)."
                >
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="physical">Físico</option>
                    <option value="subscription">Assinatura / digital</option>
                    <option value="digital">Digital</option>
                  </select>
                </FieldLabel>
                <FieldLabel
                  label="Badge"
                  tip="Selo curto no card da loja (ex.: Novo, Mais vendido). Deixe vazio se não quiser selo."
                >
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </FieldLabel>
              </div>
              <FieldLabel
                label="Características"
                tip="Lista de atributos do produto, separados por vírgula (ex.: 5 faces, cera rosa, kit completo)."
              >
                <input
                  value={form.characteristics}
                  onChange={(e) => setForm({ ...form, characteristics: e.target.value })}
                />
              </FieldLabel>
              <FieldLabel
                label="Aplicações"
                tip="Para que serve o produto, separados por vírgula (ex.: estudo anatômico, treino de escultura)."
              >
                <input
                  value={form.applications}
                  onChange={(e) => setForm({ ...form, applications: e.target.value })}
                />
              </FieldLabel>
              <div className="admin-form__checks">
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Destaque
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Ativo
                </label>
              </div>
              <div className="admin-form__actions">
                <button type="submit" className="btn-primary">
                  {editingId ? "Salvar alterações" : "Cadastrar"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-section">
            <h2>Catálogo</h2>
            <div className="admin-product-list">
              {products.map((p) => (
                <article key={p.id} className="admin-product-card">
                  {p.image_url && <img src={p.image_url} alt="" />}
                  <div>
                    <h3>
                      <span className="admin-code">{p.code}</span> {p.name}
                    </h3>
                    <p>
                      {formatPrice(p.price_cents)}
                      {p.promo_price_cents != null && <> · promo {formatPrice(p.promo_price_cents)}</>}
                    </p>
                    <p className="admin-muted">
                      Estoque: {p.stock_qty == null ? "sem controle" : `${p.stock_qty} un.`} ·{" "}
                      {p.active ? "ativo" : "inativo"}
                    </p>
                    <div className="admin-form__actions">
                      <button type="button" className="btn-outline" onClick={() => startEdit(p)}>
                        Editar
                      </button>
                      <label className="btn-outline admin-upload">
                        Foto
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadPhoto(p.id, file).catch((err) => setError(err.message));
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "volume" && <VolumePricesPanel token={token} products={productLite} notify={notify} />}

      {tab === "inventory" && <InventoryPanel token={token} notify={notify} />}

      {tab === "customers" && <CustomersPanel token={token} notify={notify} />}

      {tab === "orders" && <OrdersPanel token={token} products={productLite} notify={notify} />}

      {tab === "coupons" && <CouponsPanel token={token} notify={notify} />}

      {tab === "banners" && <BannersPanel token={token} notify={notify} />}
    </div>
  );
}
