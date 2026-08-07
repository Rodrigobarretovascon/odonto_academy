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
import { ProductInlineCard } from "./admin/ProductInlineCard";

type Tab = "dashboard" | "edit" | "orders";
type EditSection = "products" | "volume" | "inventory" | "customers" | "coupons" | "banners";

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
  images?: Array<{ id: number; image_url: string; sort_order?: number }>;
  image_urls?: string[];
  badge: string | null;
  featured: boolean;
  active: boolean;
  stock_qty: number | null;
  characteristics: string[];
  applications: string[];
}

interface Dashboard {
  revenueCents: number;
  costsCents: number;
  profitCents: number;
  bannerRevenueCents: number;
  discountsCents: number;
  ordersCount: number;
  avgTicketCents: number;
  monthRevenueCents: number;
  monthCostsCents: number;
  monthProfitCents: number;
  monthOrdersCount: number;
  activeSubscribers: number;
  costsByCategory?: Array<{
    category: string;
    amountCents: number;
    unitCents?: number;
    fixedCents?: number;
    count: number;
  }>;
  recentOrders: Array<{
    id: number;
    total_cents: number;
    created_at: string;
    customer: string;
    email: string;
    display_name?: string;
    products: string;
    channel: string;
  }>;
  recentCustomers?: Array<{
    name: string;
    phone: string | null;
    email: string | null;
    last_order_at: string;
    orders_count: number;
    total_spent_cents: number;
  }>;
  monthly: Array<{ month: string; salesCents: number; costsCents: number; profitCents: number; unitsSold?: number }>;
  expenses: Array<{
    id: number;
    description: string;
    category: string;
    amount_cents: number;
    cost_mode?: "per_unit" | "fixed";
    spent_on: string;
    notes: string | null;
  }>;
  unitsSold?: number;
  monthUnitsSold?: number;
  unitCostCents?: number;
  fixedCostCents?: number;
  variableCostsCents?: number;
  monthVariableCostsCents?: number;
  monthFixedCents?: number;
  lowStock: Array<{ id: number; name: string; stock_qty: number }>;
}

const EXPENSE_CATEGORIES = [
  { value: "produto", label: "Produto / estoque" },
  { value: "embalagem", label: "Embalagem" },
  { value: "brinde", label: "Brinde" },
  { value: "frete", label: "Frete" },
  { value: "marketing", label: "Marketing" },
  { value: "operacao", label: "Operação" },
  { value: "geral", label: "Outros" },
] as const;

function expenseCategoryLabel(code: string) {
  if (code === "compra") return "Produto / estoque";
  return EXPENSE_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

function defaultCostMode(category: string): "per_unit" | "fixed" {
  if (["marketing", "operacao", "geral"].includes(category)) return "fixed";
  return "per_unit";
}

const emptyExpenseForm = {
  description: "",
  category: "produto",
  amount: "",
  cost_mode: "per_unit" as "per_unit" | "fixed",
  spent_on: new Date().toISOString().slice(0, 10),
  notes: "",
};

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
  const [editSection, setEditSection] = useState<EditSection>("products");
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

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

  async function saveExpense(e: FormEvent) {
    e.preventDefault();
    try {
      const body = {
        description: expenseForm.description,
        category: expenseForm.category,
        amount_cents: reaisToCents(expenseForm.amount),
        cost_mode: expenseForm.cost_mode,
        spent_on: expenseForm.spent_on || undefined,
        notes: expenseForm.notes || undefined,
      };
      const wasEdit = editingExpenseId != null;
      if (wasEdit) {
        await api(`/admin/expenses/${editingExpenseId}`, { method: "PUT", body: JSON.stringify(body) }, token);
      } else {
        await api("/admin/expenses", { method: "POST", body: JSON.stringify(body) }, token);
      }
      setExpenseForm({ ...emptyExpenseForm, spent_on: new Date().toISOString().slice(0, 10) });
      setEditingExpenseId(null);
      await loadDashboard();
      notify(wasEdit ? "Custo atualizado" : "Custo registrado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar custo");
    }
  }

  function startEditExpense(ex: Dashboard["expenses"][number]) {
    setEditingExpenseId(ex.id);
    setExpenseForm({
      description: ex.description,
      category: ex.category || "geral",
      amount: (ex.amount_cents / 100).toFixed(2).replace(".", ","),
      cost_mode: ex.cost_mode === "fixed" ? "fixed" : "per_unit",
      spent_on: String(ex.spent_on).slice(0, 10),
      notes: ex.notes ?? "",
    });
    document.getElementById("admin-finance-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEditExpense() {
    setEditingExpenseId(null);
    setExpenseForm({ ...emptyExpenseForm, spent_on: new Date().toISOString().slice(0, 10) });
  }

  async function removeExpense(id: number) {
    if (!confirm("Remover este custo?")) return;
    try {
      await api(`/admin/expenses/${id}`, { method: "DELETE" }, token);
      await loadDashboard();
      notify("Custo removido");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
    }
  }

  useEffect(() => {
    setError("");
    setOk("");
    const run = async () => {
      try {
        if (tab === "dashboard") await loadDashboard();
        if (tab === "edit" || tab === "orders") await loadProducts();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar");
      }
    };
    void run();
  }, [tab, token]);

  async function patchProduct(id: number, patch: Record<string, unknown>) {
    await api(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) }, token);
    await loadProducts();
    setOk("Salvo");
    setError("");
  }

  async function removeProduct(id: number, name: string) {
    if (!confirm(`Remover “${name}” do catálogo?`)) return;
    setError("");
    setOk("");
    try {
      const result = await api<{ ok: boolean; deactivated?: boolean; message?: string }>(
        `/admin/products/${id}`,
        { method: "DELETE" },
        token,
      );
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadProducts();
      notify(result.message ?? (result.deactivated ? "Produto desativado" : "Produto removido"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover produto");
    }
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
      await api("/admin/products", { method: "POST", body: JSON.stringify(payload) }, token);
      setForm(emptyForm);
      setEditingId(null);
      setShowNewProduct(false);
      await loadProducts();
      setOk("Produto cadastrado — edite os campos no card abaixo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  async function uploadPhotos(productId: number, files: File[]) {
    const body = new FormData();
    for (const file of files) body.append("photos", file);
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? "/api"}/admin/products/${productId}/photos`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Falha no upload");
    await loadProducts();
    setOk(files.length > 1 ? `${files.length} fotos adicionadas ao carrossel` : "Foto adicionada ao carrossel");
  }

  async function removeProductImage(productId: number, imageId: number) {
    if (!confirm("Remover esta imagem do carrossel?")) return;
    try {
      await api(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE" }, token);
      await loadProducts();
      setOk("Imagem removida");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover imagem");
    }
  }

  async function setProductCover(productId: number, imageId: number) {
    try {
      await api(`/admin/products/${productId}/images/${imageId}/cover`, { method: "POST" }, token);
      await loadProducts();
      setOk("Capa atualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao definir capa");
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Início" },
    { id: "edit", label: "Editar" },
    { id: "orders", label: "Carrinho (PDV)" },
  ];

  const editSections: { id: EditSection; label: string }[] = [
    { id: "products", label: "Produtos" },
    { id: "volume", label: "Preço volume" },
    { id: "inventory", label: "Inventário" },
    { id: "customers", label: "Clientes" },
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
          <p>Edite produtos e valores na aba Editar · vendas no Carrinho (PDV)</p>
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
          <section className="admin-section">
            <h2>Meu financeiro</h2>
            <p className="admin-muted">
              O gasto total tem duas partes: <strong>por venda</strong> (embalagem, brinde, produto × unidades){" "}
              <strong>mais</strong> os gastos <strong>mensais</strong> (aluguel, anúncio, compra avulsa…).
            </p>
            <div className="admin-stats">
              <article className="stat-card stat-card--gold">
                <span>Quanto eu vendo</span>
                <strong>{formatPrice(dashboard.revenueCents)}</strong>
              </article>
              <article className="stat-card stat-card--warn">
                <span>Quanto eu gasto</span>
                <strong>{formatPrice(dashboard.costsCents)}</strong>
              </article>
              <article className={`stat-card${dashboard.profitCents >= 0 ? " stat-card--ok" : " stat-card--warn"}`}>
                <span>Quanto eu lucro</span>
                <strong>{formatPrice(dashboard.profitCents)}</strong>
              </article>
              <article className="stat-card">
                <span>Custo das vendas</span>
                <strong>{formatPrice(dashboard.variableCostsCents ?? (dashboard.unitCostCents ?? 0) * (dashboard.unitsSold ?? 0))}</strong>
              </article>
              <article className="stat-card">
                <span>Gastos mensais</span>
                <strong>{formatPrice(dashboard.fixedCostCents ?? 0)}</strong>
              </article>
              <article className="stat-card">
                <span>Este mês (lucro)</span>
                <strong>{formatPrice(dashboard.monthProfitCents)}</strong>
              </article>
            </div>
            <p className="admin-muted admin-muted--tight">
              {formatPrice(dashboard.unitCostCents ?? 0)}/un × {dashboard.unitsSold ?? 0} un. ={" "}
              {formatPrice(dashboard.variableCostsCents ?? 0)}
              {" + "}
              mensais {formatPrice(dashboard.fixedCostCents ?? 0)}
              {" = "}
              {formatPrice(dashboard.costsCents)}.{" "}
              <button type="button" className="admin-text-link" onClick={() => setTab("orders")}>
                Registrar venda no PDV
              </button>
            </p>
          </section>

          <section className="admin-section">
            <h2>Gastos por categoria</h2>
            <p className="admin-muted">
              Valores por unidade × unidades vendidas ({dashboard.unitsSold ?? 0}). O total entra em “Quanto eu gasto”.
            </p>
            {(dashboard.costsByCategory?.length ?? 0) === 0 ? (
              <p className="admin-muted">Nenhum gasto cadastrado ainda.</p>
            ) : (
              <div className="admin-stats admin-stats--cats">
                {(dashboard.costsByCategory ?? []).map((c) => (
                  <article key={c.category} className="stat-card">
                    <span>{expenseCategoryLabel(c.category)}</span>
                    <strong>{formatPrice(c.amountCents)}</strong>
                    <em className="admin-muted">
                      {(c.unitCents ?? 0) > 0
                        ? `${formatPrice(c.unitCents ?? 0)}/un × ${dashboard.unitsSold ?? 0}`
                        : null}
                      {(c.unitCents ?? 0) > 0 && (c.fixedCents ?? 0) > 0 ? " + " : null}
                      {(c.fixedCents ?? 0) > 0 ? `fixo ${formatPrice(c.fixedCents ?? 0)}` : null}
                      {(c.unitCents ?? 0) === 0 && (c.fixedCents ?? 0) === 0
                        ? `${c.count} lançamento${c.count === 1 ? "" : "s"}`
                        : null}
                    </em>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="admin-grid admin-grid--finance" id="admin-finance-edit">
            <section className="admin-section">
              <h2>{editingExpenseId ? "Editar custo" : "Registrar custo"}</h2>
              <p className="admin-muted">Escolha se o gasto é por cada venda ou do mês inteiro.</p>
              <form className="admin-form" onSubmit={saveExpense}>
                <fieldset className="admin-cost-mode">
                  <legend>Esse gasto é…</legend>
                  <div className="admin-cost-mode__options" role="group" aria-label="Tipo do gasto">
                    <button
                      type="button"
                      className={`admin-cost-mode__btn${expenseForm.cost_mode === "per_unit" ? " is-active" : ""}`}
                      onClick={() => setExpenseForm({ ...expenseForm, cost_mode: "per_unit" })}
                    >
                      <strong>Por venda</strong>
                      <span>Multiplica por cada unidade vendida (embalagem, brinde, produto…)</span>
                    </button>
                    <button
                      type="button"
                      className={`admin-cost-mode__btn${expenseForm.cost_mode === "fixed" ? " is-active" : ""}`}
                      onClick={() => setExpenseForm({ ...expenseForm, cost_mode: "fixed" })}
                    >
                      <strong>Mensal</strong>
                      <span>Entra no mês da data (aluguel, anúncio, compra avulsa…)</span>
                    </button>
                  </div>
                </fieldset>
                <FieldLabel label="Descrição" tip="Ex.: caixa kraft, brinde, aluguel, anúncio Meta.">
                  <input
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    required
                  />
                </FieldLabel>
                <FieldLabel label="Categoria" tip="Organiza onde o dinheiro vai.">
                  <select
                    value={expenseForm.category}
                    onChange={(e) => {
                      const category = e.target.value;
                      setExpenseForm({
                        ...expenseForm,
                        category,
                        // Só sugere o tipo se a pessoa ainda não escolheu ao editar; ao criar, categoria pode sugerir
                        cost_mode: editingExpenseId != null ? expenseForm.cost_mode : defaultCostMode(category),
                      });
                    }}
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel
                  label={expenseForm.cost_mode === "per_unit" ? "Valor por venda (R$)" : "Valor do mês (R$)"}
                  tip={
                    expenseForm.cost_mode === "per_unit"
                      ? "Quanto custa 1 unidade a cada venda."
                      : "Quanto você gasta nesse mês (não multiplica por venda)."
                  }
                >
                  <input
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </FieldLabel>
                <FieldLabel
                  label={expenseForm.cost_mode === "per_unit" ? "Data" : "Mês / data do gasto"}
                  tip={
                    expenseForm.cost_mode === "per_unit"
                      ? "Quando esse custo por venda passou a valer."
                      : "O valor entra no mês dessa data."
                  }
                >
                  <input
                    type="date"
                    value={expenseForm.spent_on}
                    onChange={(e) => setExpenseForm({ ...expenseForm, spent_on: e.target.value })}
                  />
                </FieldLabel>
                <FieldLabel label="Observação" tip="Opcional.">
                  <input
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  />
                </FieldLabel>
                <div className="admin-form__actions">
                  <button type="submit" className="btn-primary">
                    {editingExpenseId ? "Salvar alteração" : "Adicionar custo"}
                  </button>
                  {editingExpenseId && (
                    <button type="button" className="btn-outline" onClick={cancelEditExpense}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-section">
              <h2>Meus custos</h2>
              {dashboard.expenses.length === 0 ? (
                <p className="admin-muted">Cadastre embalagem, brinde, produto… à esquerda.</p>
              ) : (
                <div className="comparison-table-wrapper">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>Tipo</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.expenses.map((ex) => (
                        <tr key={ex.id} className={editingExpenseId === ex.id ? "is-editing" : undefined}>
                          <td>{ex.description}</td>
                          <td>{expenseCategoryLabel(ex.category)}</td>
                          <td>
                            {formatPrice(ex.amount_cents)}
                            {(ex.cost_mode ?? "per_unit") === "per_unit" ? "/venda" : "/mês"}
                          </td>
                          <td>{(ex.cost_mode ?? "per_unit") === "per_unit" ? "Por venda" : "Mensal"}</td>
                          <td className="comparison-table__actions">
                            <button type="button" className="btn-outline btn-outline--sm" onClick={() => startEditExpense(ex)}>
                              Editar
                            </button>
                            <button type="button" className="btn-outline btn-outline--sm" onClick={() => removeExpense(ex.id)}>
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <section className="admin-section">
            <h2>Este mês</h2>
            <div className="admin-stats">
              <article className="stat-card">
                <span>Vendi no mês</span>
                <strong>{formatPrice(dashboard.monthRevenueCents)}</strong>
              </article>
              <article className="stat-card">
                <span>Custo das vendas</span>
                <strong>
                  {formatPrice(
                    dashboard.monthVariableCostsCents ??
                      (dashboard.unitCostCents ?? 0) * (dashboard.monthUnitsSold ?? 0),
                  )}
                </strong>
              </article>
              <article className="stat-card">
                <span>Gastos mensais</span>
                <strong>{formatPrice(dashboard.monthFixedCents ?? 0)}</strong>
              </article>
              <article className="stat-card stat-card--warn">
                <span>Gastei no mês (total)</span>
                <strong>{formatPrice(dashboard.monthCostsCents)}</strong>
              </article>
              <article className="stat-card">
                <span>Lucro no mês</span>
                <strong>{formatPrice(dashboard.monthProfitCents)}</strong>
              </article>
              <article className="stat-card">
                <span>Unidades no mês</span>
                <strong>{dashboard.monthUnitsSold ?? 0}</strong>
              </article>
            </div>
            <p className="admin-muted admin-muted--tight">
              Custo das vendas: {formatPrice(dashboard.unitCostCents ?? 0)} × {dashboard.monthUnitsSold ?? 0} un. ={" "}
              {formatPrice(
                dashboard.monthVariableCostsCents ??
                  (dashboard.unitCostCents ?? 0) * (dashboard.monthUnitsSold ?? 0),
              )}
              . Outros gastos: {formatPrice(dashboard.monthFixedCents ?? 0)} (cadastre como{" "}
              <strong>Mensal</strong> com a data do mês).
            </p>
          </section>

          <div className="admin-grid admin-grid--finance">
            <section className="admin-section">
              <h2>Vendas recentes</h2>
              {dashboard.recentOrders.length === 0 ? (
                <p className="admin-muted">Nenhuma venda paga ainda.</p>
              ) : (
                <div className="comparison-table-wrapper">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Produtos</th>
                        <th>Total</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td>{o.display_name ?? o.customer ?? o.email ?? "—"}</td>
                          <td>{o.products}</td>
                          <td>{formatPrice(o.total_cents)}</td>
                          <td>{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-section">
              <h2>Clientes mais recentes</h2>
              {(dashboard.recentCustomers?.length ?? 0) === 0 ? (
                <p className="admin-muted">Os clientes aparecem após as primeiras vendas.</p>
              ) : (
                <div className="comparison-table-wrapper">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Contato</th>
                        <th>Pedidos</th>
                        <th>Total</th>
                        <th>Última compra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard.recentCustomers ?? []).map((c, i) => (
                        <tr key={`${c.name}-${c.email ?? c.phone ?? i}`}>
                          <td>{c.name}</td>
                          <td>{c.phone || c.email || "—"}</td>
                          <td>{c.orders_count}</td>
                          <td>{formatPrice(c.total_spent_cents)}</td>
                          <td>{new Date(c.last_order_at).toLocaleString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {dashboard.monthly.length > 0 && (
            <section className="admin-section">
              <h2>Últimos meses</h2>
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Vendas</th>
                      <th>Unid.</th>
                      <th>Gastos</th>
                      <th>Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.monthly.map((m) => (
                      <tr key={m.month}>
                        <td>{m.month}</td>
                        <td>{formatPrice(m.salesCents)}</td>
                        <td>{m.unitsSold ?? "—"}</td>
                        <td>{formatPrice(m.costsCents)}</td>
                        <td>{formatPrice(m.profitCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

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
        </>
      )}

      {tab === "edit" && (
        <div className="admin-edit-hub">
          <section className="admin-section admin-edit-hub__intro">
            <h2>Editar tudo</h2>
            <p className="admin-muted">
              Veja os valores e clique em <strong>Editar</strong> ao lado para alterar. Produtos, preços, estoque, clientes, cupons e banners ficam nesta aba.
            </p>
            <nav className="admin-subtabs" aria-label="Seções de edição">
              {editSections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`admin-subtabs__btn${editSection === s.id ? " is-on" : ""}`}
                  onClick={() => setEditSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </section>

          {editSection === "products" && (
            <>
              <section className="admin-section" id="admin-product-form">
                <div className="admin-section__row">
                  <h2>Produtos</h2>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setShowNewProduct((v) => !v);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    {showNewProduct ? "Fechar cadastro" : "Novo produto"}
                  </button>
                </div>
                <p className="admin-muted">Cada campo tem o valor e um botão Editar ao lado. Salve campo a campo.</p>

                {showNewProduct && (
                  <form className="admin-form admin-form--new-product" onSubmit={saveProduct}>
                    <h3>Cadastrar produto</h3>
                    <FieldLabel label="Nome">
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </FieldLabel>
                    <FieldLabel label="Subtítulo">
                      <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                    </FieldLabel>
                    <FieldLabel label="Descrição">
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </FieldLabel>
                    <div className="admin-form__row">
                      <FieldLabel label="Preço unitário (R$)">
                        <input
                          value={form.price_cents}
                          onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
                          placeholder="0,00"
                          required
                        />
                      </FieldLabel>
                      <FieldLabel label="Preço promocional (R$)">
                        <input
                          value={form.promo_price_cents}
                          onChange={(e) => setForm({ ...form, promo_price_cents: e.target.value })}
                          placeholder="0,00"
                        />
                      </FieldLabel>
                    </div>
                    <FieldLabel label="Estoque (unidades)">
                      <input value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
                    </FieldLabel>
                    <div className="admin-form__row">
                      <FieldLabel label="Tipo">
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                          <option value="physical">Físico</option>
                          <option value="subscription">Assinatura / digital</option>
                          <option value="digital">Digital</option>
                        </select>
                      </FieldLabel>
                      <FieldLabel label="Badge">
                        <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                      </FieldLabel>
                    </div>
                    <div className="admin-form__actions">
                      <button type="submit" className="btn-primary">
                        Cadastrar
                      </button>
                      <button type="button" className="btn-outline" onClick={() => setShowNewProduct(false)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <div className="admin-product-list admin-product-list--inline">
                {products.length === 0 && <p className="admin-muted">Nenhum produto — use Novo produto.</p>}
                {products.map((p) => (
                  <ProductInlineCard
                    key={p.id}
                    product={p}
                    selected={editingId === p.id}
                    onSelect={setEditingId}
                    onPatch={patchProduct}
                    onRemove={(id, name) => void removeProduct(id, name)}
                    onPhotos={(id, files) => void uploadPhotos(id, files).catch((err) => setError(err.message))}
                    onRemoveImage={(pid, iid) => void removeProductImage(pid, iid)}
                    onSetCover={(pid, iid) => void setProductCover(pid, iid)}
                  />
                ))}
              </div>
            </>
          )}

          {editSection === "volume" && <VolumePricesPanel token={token} products={productLite} notify={notify} />}
          {editSection === "inventory" && <InventoryPanel token={token} notify={notify} />}
          {editSection === "customers" && <CustomersPanel token={token} notify={notify} />}
          {editSection === "coupons" && <CouponsPanel token={token} notify={notify} />}
          {editSection === "banners" && <BannersPanel token={token} notify={notify} />}
        </div>
      )}

      {tab === "orders" && <OrdersPanel token={token} products={productLite} notify={notify} />}
    </div>
  );
}
