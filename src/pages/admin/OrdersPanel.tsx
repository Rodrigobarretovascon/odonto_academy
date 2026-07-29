import { useEffect, useMemo, useState } from "react";
import { api, formatPrice } from "../../lib/api";
import { FieldLabel, formatDocument, reaisToCents, type AdminProductLite, type Notify, type SaleOrder } from "./adminShared";

type ShopCustomer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
};

type PriceQuote = {
  unitPriceCents: number;
  lineTotalCents: number;
  volumeApplied: boolean;
  suggestion: {
    qty: number;
    unitPriceCents: number;
    lineTotalCents: number;
    savingsCents: number;
    message: string;
  } | null;
  nextTier: { min_qty: number; unit_price_cents: number } | null;
};

type Line = {
  key: string;
  productId: number;
  quantity: number;
  unitPriceCents: number;
  quote?: PriceQuote | null;
};

function digits(v: string) {
  return v.replace(/\D/g, "");
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrdersPanel({
  token,
  products,
  notify,
}: {
  token: string | null;
  products: AdminProductLite[];
  notify: Notify;
}) {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [nextNumber, setNextNumber] = useState("…");
  const [customers, setCustomers] = useState<ShopCustomer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [docType, setDocType] = useState<"cpf" | "cnpj">("cpf");
  const [lookupMsg, setLookupMsg] = useState("");
  const [lookupKind, setLookupKind] = useState<"ok" | "info" | "err" | "">("");
  const [askSaveCustomer, setAskSaveCustomer] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerDocument: "",
    channel: "presencial",
    paymentMethod: "pix",
    markPaid: true,
    shipping: "",
    notes: "",
    couponCode: "",
  });
  const [lines, setLines] = useState<Line[]>([]);
  const [productPick, setProductPick] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadOrders() {
    setOrders(await api<SaleOrder[]>("/admin/orders", {}, token));
  }

  async function loadMeta() {
    const [num, cust] = await Promise.all([
      api<{ orderNumber: string }>("/admin/orders/next-number", {}, token),
      api<ShopCustomer[]>("/admin/shop-customers", {}, token),
    ]);
    setNextNumber(num.orderNumber);
    setCustomers(cust);
  }

  useEffect(() => {
    void Promise.all([loadOrders(), loadMeta()]).catch((e) =>
      notify("", e instanceof Error ? e.message : "Erro"),
    );
  }, [token]);

  async function refreshQuote(line: Line): Promise<Line> {
    const quote = await api<PriceQuote>(
      `/admin/pricing/${line.productId}?qty=${line.quantity}`,
      {},
      token,
    );
    return { ...line, unitPriceCents: quote.unitPriceCents, quote };
  }

  async function addProduct(productId: number) {
    if (!productId) return;
    const existing = lines.find((l) => l.productId === productId);
    if (existing) {
      await setQty(existing.key, existing.quantity + 1);
      return;
    }
    const draft: Line = {
      key: `${productId}-${Date.now()}`,
      productId,
      quantity: 1,
      unitPriceCents: products.find((p) => p.id === productId)?.price_cents ?? 0,
    };
    const quoted = await refreshQuote(draft);
    setLines((prev) => [...prev, quoted]);
    setProductPick("");
  }

  async function setQty(key: string, qty: number) {
    const nextQty = Math.max(1, qty);
    const current = lines.find((l) => l.key === key);
    if (!current) return;
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: nextQty } : l)));
    try {
      const quoted = await refreshQuote({ ...current, quantity: nextQty });
      setLines((prev) => prev.map((l) => (l.key === key ? quoted : l)));
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro no preço");
    }
  }

  async function applySuggestion(line: Line) {
    if (!line.quote?.suggestion) return;
    await setQty(line.key, line.quote.suggestion.qty);
  }

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0),
    [lines],
  );
  const shippingCents = form.shipping ? reaisToCents(form.shipping) : 0;
  const total = Math.max(0, subtotal - couponDiscount + shippingCents);

  useEffect(() => {
    setCouponDiscount(0);
    setCouponMsg("");
  }, [subtotal, form.couponCode]);

  async function validateCoupon() {
    if (!form.couponCode.trim()) {
      setCouponDiscount(0);
      setCouponMsg("");
      return;
    }
    try {
      const res = await api<{ discountCents: number; remainingUses: number | null }>(
        "/admin/coupons/validate",
        {
          method: "POST",
          body: JSON.stringify({ code: form.couponCode, subtotalCents: subtotal }),
        },
        token,
      );
      setCouponDiscount(res.discountCents);
      setCouponMsg(
        `Cupom ok · −${formatPrice(res.discountCents)}${
          res.remainingUses != null ? ` · restam ${res.remainingUses} uso(s)` : ""
        }`,
      );
    } catch (err) {
      setCouponDiscount(0);
      setCouponMsg(err instanceof Error ? err.message : "Cupom inválido");
    }
  }

  async function lookupDocument() {
    const expected = docType === "cpf" ? 11 : 14;
    const doc = digits(form.customerDocument || customerSearch).slice(0, expected);
    if (doc.length !== expected) {
      notify("", `${docType.toUpperCase()} deve ter ${expected} dígitos`);
      return;
    }
    try {
      const data = await api<{
        document: string;
        type: string;
        valid: boolean;
        source: string;
        name?: string;
        tradeName?: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        customerId?: number;
        message?: string;
        needsManualFill?: boolean;
      }>(
        "/admin/documents/lookup",
        { method: "POST", body: JSON.stringify({ document: doc, type: docType }) },
        token,
      );

      setForm((f) => ({ ...f, customerDocument: formatDocument(data.document || doc, docType) }));

      if (!data.valid) {
        setLookupMsg(data.message ?? "Documento inválido");
        setLookupKind("err");
        notify("", data.message ?? "Documento inválido");
        return;
      }

      if (data.customerId) {
        const local =
          customers.find((c) => c.id === data.customerId) ||
          (await api<ShopCustomer[]>(`/admin/shop-customers?document=${doc}`, {}, token))[0];
        if (local) {
          selectCustomer(local);
          setLookupMsg("");
          setLookupKind("");
          notify(`Cliente do cadastro: ${local.name}`);
          return;
        }
      }

      setCustomerId(null);
      setForm((f) => ({
        ...f,
        customerDocument: formatDocument(data.document || doc, docType),
        customerName: data.name || data.tradeName || f.customerName,
        customerEmail: data.email || f.customerEmail,
        customerPhone: data.phone || f.customerPhone,
        notes: data.address ? (f.notes ? f.notes : `Endereço RF: ${data.address}`) : f.notes,
      }));
      if (data.source === "brasilapi" || data.source === "external") {
        setLookupMsg("");
        setLookupKind("ok");
        notify(docType === "cnpj" ? "CNPJ preenchido pela consulta pública" : "CPF preenchido pelo provedor");
      } else if (data.needsManualFill || data.source === "none") {
        setLookupMsg(docType === "cpf" ? "CPF válido — preencha o nome." : (data.message ?? "Preencha os dados."));
        setLookupKind("info");
      } else {
        setLookupMsg(data.message ?? "");
        setLookupKind("info");
      }
    } catch (err) {
      setLookupKind("err");
      notify("", err instanceof Error ? err.message : "Falha na consulta");
    }
  }

  function selectCustomer(c: ShopCustomer) {
    setCustomerId(c.id);
    setForm((f) => ({
      ...f,
      customerName: c.name,
      customerEmail: c.email ?? "",
      customerPhone: c.phone ?? "",
      customerDocument: c.document ?? "",
    }));
    setCustomerSearch("");
    setLookupMsg("");
  }

  function resetForm() {
    setCustomerId(null);
    setLines([]);
    setCouponDiscount(0);
    setCouponMsg("");
    setAskSaveCustomer(false);
    setLookupMsg("");
    setForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerDocument: "",
      channel: "presencial",
      paymentMethod: "pix",
      markPaid: true,
      shipping: "",
      notes: "",
      couponCode: "",
    });
    void loadMeta();
  }

  async function submitSale(saveCustomer: boolean) {
    if (!lines.length) {
      notify("", "Adicione ao menos um produto");
      return;
    }
    if (!form.customerName.trim()) {
      notify("", "Informe o nome do cliente");
      return;
    }
    setBusy(true);
    try {
      if (form.couponCode.trim() && couponDiscount === 0) {
        await validateCoupon();
      }
      const res = await api<{ orderNumber: string; message: string; totalCents: number }>(
        "/admin/orders/sale",
        {
          method: "POST",
          body: JSON.stringify({
            customerId: customerId ?? undefined,
            customerName: form.customerName,
            customerEmail: form.customerEmail || undefined,
            customerPhone: form.customerPhone || undefined,
            customerDocument: form.customerDocument || undefined,
            saveCustomer,
            channel: form.channel,
            paymentMethod: form.paymentMethod,
            markPaid: form.markPaid,
            shippingCents,
            notes: form.notes || undefined,
            couponCode: form.couponCode.trim() || undefined,
            items: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPriceCents: l.unitPriceCents,
            })),
          }),
        },
        token,
      );
      notify(`${res.message} · ${res.orderNumber} · ${formatPrice(res.totalCents)}`);
      resetForm();
      await loadOrders();
      await loadMeta();
    } catch (err) {
      notify("", err instanceof Error ? err.message : "Erro no pedido");
    } finally {
      setBusy(false);
      setAskSaveCustomer(false);
    }
  }

  function onSubmitClick() {
    const hasDoc = digits(form.customerDocument).length >= 11;
    if (hasDoc && !customerId) {
      setAskSaveCustomer(true);
      return;
    }
    void submitSale(false);
  }

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.document ?? "").includes(digits(customerSearch)) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="order-desk order-desk--rows">
      <header className="order-desk__head">
        <div className="order-desk__head-main">
          <p className="order-desk__eyebrow">Carrinho de venda (PDV)</p>
          <div className="order-desk__meta">
            <span>
              Nº <strong>{nextNumber}</strong>
            </span>
            <span className="order-desk__meta-sep" aria-hidden="true" />
            <span>{todayLabel()}</span>
            <span className="admin-badge is-on">Automático</span>
          </div>
        </div>
        <div className="order-desk__head-actions">
          <button type="button" className="btn-outline" onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Ocultar histórico" : "Histórico"}
          </button>
          <button type="button" className="btn-outline" onClick={resetForm}>
            Limpar
          </button>
        </div>
      </header>

      <section className="order-desk__panel order-desk__row">
        <div className="order-desk__row-head">
          <p className="order-desk__panel-title">Cliente</p>
          <div className="order-desk__tabs" role="group" aria-label="Tipo de documento">
            <button
              type="button"
              className={docType === "cpf" ? "is-on" : ""}
              onClick={() => {
                setDocType("cpf");
                setForm((f) => ({ ...f, customerDocument: formatDocument(f.customerDocument, "cpf") }));
                setLookupMsg("");
                setLookupKind("");
              }}
            >
              CPF
            </button>
            <button
              type="button"
              className={docType === "cnpj" ? "is-on" : ""}
              onClick={() => {
                setDocType("cnpj");
                setForm((f) => ({ ...f, customerDocument: formatDocument(f.customerDocument, "cnpj") }));
                setLookupMsg("");
                setLookupKind("");
              }}
            >
              CNPJ
            </button>
          </div>
        </div>

        <div className="order-desk__fields order-desk__fields--customer">
          <FieldLabel
            label={docType === "cpf" ? "CPF" : "CNPJ"}
            tip={
              docType === "cnpj"
                ? "Busca no cadastro local e, se não achar, consulta a Receita Federal (BrasilAPI) para preencher razão social."
                : "Busca no cadastro local e valida o CPF. Nome e dados de pessoa física não vêm de API pública — digite o nome se for cliente novo."
            }
          >
            <div className="order-desk__inline-search">
              <input
                value={form.customerDocument}
                onChange={(e) => {
                  setCustomerId(null);
                  const formatted = formatDocument(e.target.value, docType);
                  setForm({ ...form, customerDocument: formatted });
                  setCustomerSearch(formatted);
                }}
                placeholder={docType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                inputMode="numeric"
              />
              <button type="button" className="btn-outline" onClick={() => void lookupDocument()}>
                Buscar
              </button>
            </div>
          </FieldLabel>
          <FieldLabel label="Nome" tip="Nome completo do comprador neste pedido (aparece no histórico e no comprovante).">
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
          </FieldLabel>
          <FieldLabel label="Telefone" tip="Número para contato ou WhatsApp. Pode ficar em branco se não tiver.">
            <input
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
          </FieldLabel>
          <FieldLabel label="E-mail" tip="E-mail do cliente para envio de confirmação. Pode ficar em branco.">
            <input
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
          </FieldLabel>
        </div>

        {lookupMsg && (
          <p className={`doc-lookup-msg doc-lookup-msg--${lookupKind || "info"}`}>{lookupMsg}</p>
        )}

        {(customerSearch.trim() || filteredCustomers.length > 0) && (
          <div className="order-desk__customer-strip">
            <input
              placeholder="Filtrar cadastro por nome, e-mail ou documento"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <div className="order-desk__customer-list order-desk__customer-list--row">
              {filteredCustomers.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`order-desk__customer-item${customerId === c.id ? " is-on" : ""}`}
                  onClick={() => selectCustomer(c)}
                >
                  <strong>{c.name}</strong>
                  <span>{c.document || c.email || c.phone || "—"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="order-desk__panel order-desk__row">
        <div className="order-desk__row-head">
          <p className="order-desk__panel-title">Itens</p>
          <div className="order-desk__add order-desk__add--wide">
            <select value={productPick} onChange={(e) => void addProduct(Number(e.target.value))}>
              <option value="">+ Adicionar produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name} · {formatPrice(p.price_cents)}
                  {p.stock_qty != null ? ` · est. ${p.stock_qty}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="order-lines order-lines--table">
          {lines.length === 0 && (
            <p className="admin-muted">Nenhum item. Escolha um produto acima (qtd inicia em 1).</p>
          )}
          {lines.length > 0 && (
            <div className="order-line order-line--head" aria-hidden="true">
              <span>Produto</span>
              <span>Qtd</span>
              <span>Preço un.</span>
              <span>Total</span>
              <span />
            </div>
          )}
          {lines.map((line) => {
            const product = products.find((p) => p.id === line.productId);
            return (
              <div key={line.key} className="order-line-block">
                <article className="order-line order-line--row">
                  <div className="order-line__product">
                    <strong>
                      <span className="admin-code">{product?.code}</span> {product?.name}
                    </strong>
                    {line.quote?.volumeApplied && <span className="admin-badge is-on">Volume</span>}
                  </div>
                  <label className="order-line__qty">
                    <span className="order-line__label">Qtd</span>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => void setQty(line.key, Number(e.target.value || 1))}
                    />
                  </label>
                  <div className="order-line__price">
                    <span className="order-line__label">Preço un.</span>
                    <strong>{formatPrice(line.unitPriceCents)}</strong>
                  </div>
                  <div className="order-line__total">
                    <span className="order-line__label">Total</span>
                    <strong>{formatPrice(line.unitPriceCents * line.quantity)}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-outline order-line__remove"
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                  >
                    Remover
                  </button>
                </article>
                {line.quote?.suggestion && (
                  <div className="order-line__hint">
                    <p>{line.quote.suggestion.message}</p>
                    <button type="button" className="btn-primary" onClick={() => void applySuggestion(line)}>
                      Ajustar para {line.quote.suggestion.qty} un. (
                      {formatPrice(line.quote.suggestion.unitPriceCents)}/un.)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="order-desk__panel order-desk__row order-desk__checkout">
        <div className="order-desk__fields order-desk__fields--checkout">
          <FieldLabel label="Canal" tip="Onde a venda aconteceu: presencial, WhatsApp, Instagram, feira, etc.">
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="presencial">Presencial</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="feira">Feira</option>
              <option value="admin">Admin</option>
              <option value="web">Web</option>
            </select>
          </FieldLabel>
          <FieldLabel
            label="Pagamento"
            tip="Forma combinada com o cliente. Pix e cartão ficarão prontos para o gateway de pagamento."
          >
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="pix">Pix</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
              <option value="cash">Dinheiro</option>
              <option value="transfer">Transferência</option>
              <option value="manual">Manual</option>
            </select>
          </FieldLabel>
          <FieldLabel
            label="Cupom"
            tip="Código promocional cadastrado. Ao aplicar, o sistema checa validade e quantos usos ainda restam."
          >
            <div className="order-desk__inline-search">
              <input
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                placeholder="CÓDIGO"
              />
              <button type="button" className="btn-outline" onClick={() => void validateCoupon()}>
                Aplicar
              </button>
            </div>
          </FieldLabel>
          <FieldLabel
            label="Frete (R$)"
            tip="Valor cobrado pelo envio, em reais. Deixe 0 ou vazio se a entrega for gratuita ou retirada."
          >
            <input value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} />
          </FieldLabel>
          <FieldLabel
            label="Obs."
            tip="Anotação interna do pedido (ex.: prazo de entrega, combinado com o cliente). Não aparece na loja."
          >
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </FieldLabel>
        </div>

        {couponMsg && (
          <p className={`order-desk__coupon-msg${couponDiscount ? "" : " is-err"}`}>{couponMsg}</p>
        )}

        <div className="order-desk__checkout-bar">
          <label className="order-desk__paid">
            <input
              type="checkbox"
              checked={form.markPaid}
              onChange={(e) => setForm({ ...form, markPaid: e.target.checked })}
            />
            Já pago (abate estoque agora)
          </label>
          <dl className="order-desk__totals order-desk__totals--inline">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Cupom</dt>
              <dd>−{formatPrice(couponDiscount)}</dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd>{formatPrice(shippingCents)}</dd>
            </div>
            <div className="is-total">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <button type="button" className="btn-primary order-desk__submit" disabled={busy} onClick={onSubmitClick}>
            {busy ? "Salvando…" : "Finalizar carrinho"}
          </button>
        </div>
      </section>

      {askSaveCustomer && (
        <div className="order-modal" role="dialog" aria-modal="true">
          <div className="order-modal__card">
            <h3>Gravar cadastro do cliente?</h3>
            <p>
              O documento <strong>{form.customerDocument}</strong> ainda não está no cadastro. Deseja salvar{" "}
              <strong>{form.customerName}</strong> para próximas vendas?
            </p>
            <div className="admin-form__actions">
              <button type="button" className="btn-primary" onClick={() => void submitSale(true)}>
                Sim, gravar cadastro
              </button>
              <button type="button" className="btn-outline" onClick={() => void submitSale(false)}>
                Não, só neste pedido
              </button>
              <button type="button" className="btn-outline" onClick={() => setAskSaveCustomer(false)}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <section className="admin-section" style={{ marginTop: "0.25rem" }}>
          <h2>Histórico recente</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Canal</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.order_number ?? o.id}</td>
                    <td>{o.customer ?? o.guest_name ?? o.email ?? o.guest_email ?? "—"}</td>
                    <td>{o.channel}</td>
                    <td>{o.payment_method}</td>
                    <td>
                      {o.status}/{o.payment_status}
                    </td>
                    <td>{formatPrice(o.total_cents)}</td>
                    <td>{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                    <td>
                      {o.payment_status !== "paid" && (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() =>
                            void api(`/admin/orders/${o.id}/mark-paid`, { method: "POST", body: "{}" }, token)
                              .then(() => {
                                notify("Pedido marcado como pago");
                                return loadOrders();
                              })
                              .catch((err) => notify("", err instanceof Error ? err.message : "Erro"))
                          }
                        >
                          Marcar pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
