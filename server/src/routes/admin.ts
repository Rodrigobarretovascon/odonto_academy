import { Router } from "express";
import multer from "multer";
import { mkdirSync, existsSync } from "fs";
import { resolve, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { query } from "../db/pool.js";
import { adminRequired } from "../middleware/auth.js";
import { adjustStock, debitStock, resolveUnitPrice, upsertInventory, upsertPrice } from "../services/stock.js";
import { nextProductCode, slugify } from "../db/migrate.js";
import commerceRoutes from "./admin-commerce.js";

const router = Router();
router.use(adminRequired);
router.use(commerceRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = resolve(__dirname, "../../../public/uploads/products");
const bannerUploadDir = resolve(__dirname, "../../../public/uploads/banners");
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
if (!existsSync(bannerUploadDir)) mkdirSync(bannerUploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safe = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname) || ".jpg"}`;
      cb(null, safe);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Apenas imagens"));
      return;
    }
    cb(null, true);
  },
});

const uploadBanner = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, bannerUploadDir),
    filename: (_req, file, cb) => {
      const safe = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname) || ".jpg"}`;
      cb(null, safe);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Apenas imagens"));
      return;
    }
    cb(null, true);
  },
});

const PRODUCT_SELECT = `
  id, code, slug, name, subtitle, description, price_cents, promo_price_cents, type, access_days,
  image_url, badge, featured, active, sort_order, stock_qty, track_stock, characteristics, applications,
  created_at, updated_at
`;

async function listProductImages(productId: number) {
  const r = await query<{ id: number; image_url: string; sort_order: number }>(
    `SELECT id, image_url, sort_order FROM product_images
     WHERE product_id = $1 ORDER BY sort_order ASC, id ASC`,
    [productId],
  );
  return r.rows;
}

async function imagesByProductIds(ids: number[]) {
  const map = new Map<number, Array<{ id: number; image_url: string; sort_order: number }>>();
  if (ids.length === 0) return map;
  const r = await query<{ id: number; product_id: number; image_url: string; sort_order: number }>(
    `SELECT id, product_id, image_url, sort_order FROM product_images
     WHERE product_id = ANY($1::int[])
     ORDER BY sort_order ASC, id ASC`,
    [ids],
  );
  for (const row of r.rows) {
    const list = map.get(row.product_id) ?? [];
    list.push({ id: row.id, image_url: row.image_url, sort_order: row.sort_order });
    map.set(row.product_id, list);
  }
  return map;
}

/** Mantém products.image_url = primeira imagem do carrossel (compatibilidade). */
async function syncProductCover(productId: number) {
  const imgs = await listProductImages(productId);
  const cover = imgs[0]?.image_url ?? null;
  await query(`UPDATE products SET image_url = $2, updated_at = NOW() WHERE id = $1`, [productId, cover]);
  return imgs;
}

router.get("/dashboard", async (_req, res) => {
  const [
    revenue,
    orders,
    unitsSoldRow,
    monthSales,
    monthUnitsRow,
    unitCostRow,
    fixedCostRow,
    monthFixedRow,
    subs,
    recent,
    lowStock,
    bannerBill,
    discounts,
  ] = await Promise.all([
    query<{ total: string }>(
      `SELECT COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE status = 'paid'`,
    ),
    query<{ count: string }>(`SELECT COUNT(*) AS count FROM orders WHERE status = 'paid'`),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(oi.quantity), 0)::text AS total
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'paid'`,
    ),
    query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM(total_cents), 0) AS total, COUNT(*)::text AS count
       FROM orders
       WHERE status = 'paid'
         AND date_trunc('month', COALESCE(paid_at, created_at)) = date_trunc('month', CURRENT_DATE)`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(oi.quantity), 0)::text AS total
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'paid'
         AND date_trunc('month', COALESCE(o.paid_at, o.created_at)) = date_trunc('month', CURRENT_DATE)`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM business_expenses
       WHERE cost_mode = 'per_unit'`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM business_expenses
       WHERE cost_mode = 'fixed'`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM business_expenses
       WHERE cost_mode = 'fixed'
         AND date_trunc('month', spent_on) = date_trunc('month', CURRENT_DATE)`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT user_id) AS count FROM subscriptions WHERE active = true AND expires_at > NOW()`,
    ),
    query(
      `SELECT o.id, o.total_cents, o.created_at, o.channel, u.name AS customer, u.email,
              COALESCE(o.guest_name, u.name) AS display_name,
              string_agg(p.name, ', ') AS products
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status = 'paid'
       GROUP BY o.id, u.name, u.email
       ORDER BY o.created_at DESC LIMIT 20`,
    ),
    query(
      `SELECT id, name, stock_qty FROM product_catalog
       WHERE stock_qty IS NOT NULL AND stock_qty <= 5 AND active = true
       ORDER BY stock_qty ASC`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(impression_count * cost_per_impression_cents), 0) AS total
       FROM ad_banners`,
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(discount_cents + coupon_discount_cents), 0) AS total
       FROM orders WHERE status = 'paid'`,
    ),
  ]);

  const unitsSold = Number(unitsSoldRow.rows[0].total);
  const monthUnitsSold = Number(monthUnitsRow.rows[0].total);
  const unitCostCents = Number(unitCostRow.rows[0].total);
  const fixedCostCents = Number(fixedCostRow.rows[0].total);
  const variableCostsCents = unitCostCents * unitsSold;
  const costsCents = variableCostsCents + fixedCostCents;
  const monthFixedCents = Number(monthFixedRow.rows[0].total);
  const monthVariableCostsCents = unitCostCents * monthUnitsSold;
  const monthCostsCents = monthVariableCostsCents + monthFixedCents;

  const monthlyUnits = await query<{ month: string; units: string }>(
    `SELECT to_char(date_trunc('month', COALESCE(o.paid_at, o.created_at)), 'YYYY-MM') AS month,
            COALESCE(SUM(oi.quantity), 0)::text AS units
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'paid'
     GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
  );
  const unitsByMonth = new Map(monthlyUnits.rows.map((r) => [r.month, Number(r.units)]));

  const monthlyFixed = await query<{ month: string; total: string }>(
    `SELECT to_char(date_trunc('month', spent_on), 'YYYY-MM') AS month,
            SUM(amount_cents)::text AS total
     FROM business_expenses
     WHERE cost_mode = 'fixed'
     GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
  );
  const fixedByMonth = new Map(monthlyFixed.rows.map((r) => [r.month, Number(r.total)]));

  const monthlySalesOnly = await query<{ month: string; total: string }>(
    `SELECT to_char(date_trunc('month', COALESCE(paid_at, created_at)), 'YYYY-MM') AS month,
            SUM(total_cents)::text AS total
     FROM orders WHERE status = 'paid'
     GROUP BY 1 ORDER BY 1 DESC LIMIT 6`,
  );

  const monthKeys = new Set<string>([
    ...monthlySalesOnly.rows.map((r) => r.month),
    ...fixedByMonth.keys(),
    ...unitsByMonth.keys(),
  ]);
  const monthly = [...monthKeys]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 6)
    .map((month) => {
      const sales = Number(monthlySalesOnly.rows.find((r) => r.month === month)?.total ?? 0);
      const units = unitsByMonth.get(month) ?? 0;
      const costs = unitCostCents * units + (fixedByMonth.get(month) ?? 0);
      return { month, salesCents: sales, costsCents: costs, profitCents: sales - costs, unitsSold: units };
    });

  const expenses = await query(
    `SELECT id, description, category, amount_cents, cost_mode, spent_on, notes, created_at
     FROM business_expenses
     ORDER BY spent_on DESC, id DESC
     LIMIT 50`,
  );

  const costsByCategory = await query<{
    category: string;
    unit_total: string;
    fixed_total: string;
    count: string;
  }>(
    `SELECT category,
            COALESCE(SUM(amount_cents) FILTER (WHERE cost_mode = 'per_unit'), 0)::text AS unit_total,
            COALESCE(SUM(amount_cents) FILTER (WHERE cost_mode = 'fixed'), 0)::text AS fixed_total,
            COUNT(*)::text AS count
     FROM business_expenses
     GROUP BY category
     ORDER BY (
       COALESCE(SUM(amount_cents) FILTER (WHERE cost_mode = 'per_unit'), 0) * $1
       + COALESCE(SUM(amount_cents) FILTER (WHERE cost_mode = 'fixed'), 0)
     ) DESC`,
    [unitsSold],
  );

  const recentCustomers = await query(
    `SELECT
       COALESCE(NULLIF(TRIM(c.name), ''), NULLIF(TRIM(o.guest_name), ''), NULLIF(TRIM(u.name), ''), 'Cliente') AS name,
       COALESCE(NULLIF(TRIM(c.phone), ''), NULLIF(TRIM(o.customer_phone), '')) AS phone,
       COALESCE(NULLIF(TRIM(c.email), ''), NULLIF(TRIM(u.email), '')) AS email,
       MAX(COALESCE(o.paid_at, o.created_at)) AS last_order_at,
       COUNT(*)::int AS orders_count,
       COALESCE(SUM(o.total_cents), 0)::int AS total_spent_cents
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.status = 'paid'
     GROUP BY 1, 2, 3
     ORDER BY MAX(COALESCE(o.paid_at, o.created_at)) DESC
     LIMIT 12`,
  );

  const revenueCents = Number(revenue.rows[0].total);
  const ordersCount = Number(orders.rows[0].count);
  const monthRevenueCents = Number(monthSales.rows[0].total);
  const monthOrdersCount = Number(monthSales.rows[0].count);
  const bannerRevenueCents = Number(bannerBill.rows[0].total);
  const discountsCents = Number(discounts.rows[0].total);
  const activeSubscribers = Number(subs.rows[0].count);

  const live = {
    revenueCents,
    costsCents,
    ordersCount,
    activeSubscribers,
    monthRevenueCents,
    monthCostsCents,
    monthOrdersCount,
    bannerRevenueCents,
    discountsCents,
    unitsSold,
    unitCostCents,
    fixedCostCents,
    variableCostsCents,
    monthVariableCostsCents,
    monthFixedCents,
  };

  res.json({
    revenueCents,
    costsCents,
    profitCents: revenueCents - costsCents,
    bannerRevenueCents,
    discountsCents,
    ordersCount,
    unitsSold,
    monthUnitsSold,
    unitCostCents,
    fixedCostCents,
    variableCostsCents,
    monthVariableCostsCents,
    monthFixedCents,
    avgTicketCents: ordersCount > 0 ? Math.round(revenueCents / ordersCount) : 0,
    monthRevenueCents,
    monthCostsCents,
    monthProfitCents: monthRevenueCents - monthCostsCents,
    monthOrdersCount,
    activeSubscribers,
    recentOrders: recent.rows,
    recentCustomers: recentCustomers.rows,
    costsByCategory: costsByCategory.rows.map((r) => {
      const unitCents = Number(r.unit_total);
      const fixedCents = Number(r.fixed_total);
      return {
        category: r.category,
        unitCents,
        fixedCents,
        amountCents: unitCents * unitsSold + fixedCents,
        count: Number(r.count),
      };
    }),
    monthly,
    expenses: expenses.rows,
    lowStock: lowStock.rows,
    manualEnabled: false,
    live,
  });
});

router.get("/finance-overrides", async (_req, res) => {
  const r = await query(
    `SELECT enabled, revenue_cents, costs_cents, orders_count, active_subscribers,
            month_revenue_cents, month_costs_cents, month_orders_count,
            banner_revenue_cents, discounts_cents, updated_at
     FROM finance_dashboard_overrides WHERE id = 1`,
  );
  res.json(r.rows[0] ?? { enabled: false });
});

router.put("/finance-overrides", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const num = (key: string, fallback = 0) => {
      const v = Number(body[key] ?? fallback);
      if (!Number.isFinite(v) || v < 0) throw new Error(`Valor inválido: ${key}`);
      return Math.round(v);
    };
    const enabled = Boolean(body.enabled);
    const updated = await query(
      `INSERT INTO finance_dashboard_overrides (
         id, enabled, revenue_cents, costs_cents, orders_count, active_subscribers,
         month_revenue_cents, month_costs_cents, month_orders_count,
         banner_revenue_cents, discounts_cents, updated_at
       ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET
         enabled = EXCLUDED.enabled,
         revenue_cents = EXCLUDED.revenue_cents,
         costs_cents = EXCLUDED.costs_cents,
         orders_count = EXCLUDED.orders_count,
         active_subscribers = EXCLUDED.active_subscribers,
         month_revenue_cents = EXCLUDED.month_revenue_cents,
         month_costs_cents = EXCLUDED.month_costs_cents,
         month_orders_count = EXCLUDED.month_orders_count,
         banner_revenue_cents = EXCLUDED.banner_revenue_cents,
         discounts_cents = EXCLUDED.discounts_cents,
         updated_at = NOW()
       RETURNING enabled, revenue_cents, costs_cents, orders_count, active_subscribers,
                 month_revenue_cents, month_costs_cents, month_orders_count,
                 banner_revenue_cents, discounts_cents, updated_at`,
      [
        enabled,
        num("revenue_cents"),
        num("costs_cents"),
        num("orders_count"),
        num("active_subscribers"),
        num("month_revenue_cents"),
        num("month_costs_cents"),
        num("month_orders_count"),
        num("banner_revenue_cents"),
        num("discounts_cents"),
      ],
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao salvar valores" });
  }
});

function normalizeCostMode(raw: unknown, category: string): "per_unit" | "fixed" {
  if (raw === "fixed" || raw === "per_unit") return raw;
  const cat = category.trim().toLowerCase();
  if (["marketing", "operacao", "geral"].includes(cat)) return "fixed";
  return "per_unit";
}

router.get("/expenses", async (_req, res) => {
  const rows = await query(
    `SELECT id, description, category, amount_cents, cost_mode, spent_on, notes, created_at
     FROM business_expenses
     ORDER BY spent_on DESC, id DESC
     LIMIT 100`,
  );
  res.json(rows.rows);
});

router.post("/expenses", async (req, res) => {
  try {
    const body = req.body as {
      description?: string;
      category?: string;
      amount_cents?: number;
      cost_mode?: string;
      spent_on?: string;
      notes?: string;
    };
    const description = String(body.description ?? "").trim();
    const amount = Number(body.amount_cents ?? 0);
    const category = String(body.category ?? "geral").trim() || "geral";
    if (!description || !(amount > 0)) {
      res.status(400).json({ error: "Descrição e valor são obrigatórios" });
      return;
    }
    const costMode = normalizeCostMode(body.cost_mode, category);
    const inserted = await query(
      `INSERT INTO business_expenses (description, category, amount_cents, cost_mode, spent_on, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6)
       RETURNING id, description, category, amount_cents, cost_mode, spent_on, notes, created_at`,
      [description, category, Math.round(amount), costMode, body.spent_on || null, body.notes?.trim() || null],
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao salvar custo" });
  }
});

router.put("/expenses/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const body = req.body as {
      description?: string;
      category?: string;
      amount_cents?: number;
      cost_mode?: string;
      spent_on?: string;
      notes?: string;
    };
    const description = String(body.description ?? "").trim();
    const amount = Number(body.amount_cents ?? 0);
    const category = String(body.category ?? "geral").trim() || "geral";
    if (!description || !(amount > 0)) {
      res.status(400).json({ error: "Descrição e valor são obrigatórios" });
      return;
    }
    const costMode = normalizeCostMode(body.cost_mode, category);
    const updated = await query(
      `UPDATE business_expenses
       SET description = $2,
           category = $3,
           amount_cents = $4,
           cost_mode = $5,
           spent_on = COALESCE($6::date, spent_on),
           notes = $7
       WHERE id = $1
       RETURNING id, description, category, amount_cents, cost_mode, spent_on, notes, created_at`,
      [id, description, category, Math.round(amount), costMode, body.spent_on || null, body.notes?.trim() || null],
    );
    if (!updated.rows[0]) {
      res.status(404).json({ error: "Custo não encontrado" });
      return;
    }
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar custo" });
  }
});

router.delete("/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query(`DELETE FROM business_expenses WHERE id = $1`, [id]);
  res.json({ ok: true });
});

router.get("/products", async (_req, res) => {
  const products = await query(
    `SELECT ${PRODUCT_SELECT} FROM product_catalog ORDER BY sort_order, id`,
  );
  const volumes = await query(
    `SELECT id, product_id, min_qty, unit_price_cents FROM product_volume_prices ORDER BY min_qty`,
  );
  const byProduct = new Map<number, typeof volumes.rows>();
  for (const v of volumes.rows) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(v);
    byProduct.set(v.product_id, list);
  }
  const imagesMap = await imagesByProductIds(products.rows.map((p) => Number(p.id)));
  res.json(
    products.rows.map((p) => {
      const images = imagesMap.get(Number(p.id)) ?? [];
      return {
        ...p,
        volume_prices: byProduct.get(p.id) ?? [],
        images,
        image_urls: images.map((i) => i.image_url),
      };
    }),
  );
});

router.post("/products", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body.name) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }
    const code = await nextProductCode();
    let slug = slugify(String(body.slug || body.name));
    if (!slug) slug = code.toLowerCase();
    // ensure unique slug
    const clash = await query(`SELECT 1 FROM products WHERE slug = $1`, [slug]);
    if (clash.rows[0]) slug = `${slug}-${code.toLowerCase()}`;

    const priceCents = Number(body.price_cents ?? 0);
    const promo =
      body.promo_price_cents === null || body.promo_price_cents === "" || body.promo_price_cents == null
        ? null
        : Number(body.promo_price_cents);
    const stockQty =
      body.stock_qty === "" || body.stock_qty == null ? null : Number(body.stock_qty);

    const inserted = await query<{ id: number }>(
      `INSERT INTO products (
         code, slug, name, subtitle, description, type, access_days,
         image_url, badge, featured, active, sort_order, characteristics, applications
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        code,
        slug,
        body.name,
        body.subtitle ?? "",
        body.description ?? "",
        body.type ?? "physical",
        Number(body.access_days ?? 0),
        body.image_url ?? null,
        body.badge ?? null,
        Boolean(body.featured),
        body.active !== false,
        Number(body.sort_order ?? 0),
        Array.isArray(body.characteristics) ? body.characteristics : [],
        Array.isArray(body.applications) ? body.applications : [],
      ],
    );
    const id = inserted.rows[0].id;
    await upsertPrice(id, priceCents, promo);
    await upsertInventory(id, stockQty);

    if (Array.isArray(body.volume_prices)) {
      for (const vp of body.volume_prices as { min_qty: number; unit_price_cents: number }[]) {
        await query(
          `INSERT INTO product_volume_prices (product_id, min_qty, unit_price_cents) VALUES ($1,$2,$3)
           ON CONFLICT (product_id, min_qty) DO UPDATE SET unit_price_cents = EXCLUDED.unit_price_cents`,
          [id, Number(vp.min_qty), Number(vp.unit_price_cents)],
        );
      }
    }
    const product = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
    res.status(201).json(product.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao criar produto" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const current = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    const cur = current.rows[0];
    const promo =
      body.promo_price_cents === undefined
        ? cur.promo_price_cents
        : body.promo_price_cents === null || body.promo_price_cents === ""
          ? null
          : Number(body.promo_price_cents);
    const stock =
      body.stock_qty === undefined
        ? cur.stock_qty
        : body.stock_qty === null || body.stock_qty === ""
          ? null
          : Number(body.stock_qty);
    const priceCents = body.price_cents != null ? Number(body.price_cents) : cur.price_cents;

    await query(
      `UPDATE products SET
         name = $2, subtitle = $3, description = $4, type = $5, access_days = $6,
         image_url = $7, badge = $8, featured = $9, active = $10, sort_order = $11,
         characteristics = $12, applications = $13, updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        body.name ?? cur.name,
        body.subtitle ?? cur.subtitle,
        body.description ?? cur.description,
        body.type ?? cur.type,
        body.access_days != null ? Number(body.access_days) : cur.access_days,
        body.image_url ?? cur.image_url,
        body.badge !== undefined ? body.badge : cur.badge,
        body.featured != null ? Boolean(body.featured) : cur.featured,
        body.active != null ? Boolean(body.active) : cur.active,
        body.sort_order != null ? Number(body.sort_order) : cur.sort_order,
        Array.isArray(body.characteristics) ? body.characteristics : cur.characteristics,
        Array.isArray(body.applications) ? body.applications : cur.applications,
      ],
    );
    await upsertPrice(id, priceCents, promo);
    await upsertInventory(id, stock);

    if (Array.isArray(body.volume_prices)) {
      await query(`DELETE FROM product_volume_prices WHERE product_id = $1`, [id]);
      for (const vp of body.volume_prices as { min_qty: number; unit_price_cents: number }[]) {
        await query(
          `INSERT INTO product_volume_prices (product_id, min_qty, unit_price_cents) VALUES ($1,$2,$3)`,
          [id, Number(vp.min_qty), Number(vp.unit_price_cents)],
        );
      }
    }
    const volumes = await query(
      `SELECT id, product_id, min_qty, unit_price_cents FROM product_volume_prices WHERE product_id = $1 ORDER BY min_qty`,
      [id],
    );
    const product = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
    res.json({ ...product.rows[0], volume_prices: volumes.rows });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const current = await query(`SELECT id, name FROM products WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }

    const linked = await query<{ src: string }>(
      `SELECT 'pedido' AS src FROM order_items WHERE product_id = $1
       UNION ALL
       SELECT 'assinatura' FROM subscriptions WHERE product_id = $1
       UNION ALL
       SELECT 'estoque' FROM stock_movements WHERE product_id = $1
       UNION ALL
       SELECT 'inventario' FROM inventory_count_lines WHERE product_id = $1
       LIMIT 1`,
      [id],
    );

    if (linked.rows[0]) {
      await query(`UPDATE products SET active = false, updated_at = NOW() WHERE id = $1`, [id]);
      res.json({
        ok: true,
        deactivated: true,
        message: `Produto vinculado a ${linked.rows[0].src} — foi desativado (não apagado).`,
      });
      return;
    }

    await query(`DELETE FROM product_volume_prices WHERE product_id = $1`, [id]);
    await query(`DELETE FROM volume_price_tiers WHERE schedule_id IN (SELECT id FROM volume_price_schedules WHERE product_id = $1)`, [id]);
    await query(`DELETE FROM volume_price_schedules WHERE product_id = $1`, [id]);
    await query(`DELETE FROM products WHERE id = $1`, [id]);
    res.json({ ok: true, deactivated: false, message: "Produto removido do catálogo." });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao remover produto" });
  }
});

router.post("/products/:id/photo", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Arquivo obrigatório" });
    return;
  }
  const id = Number(req.params.id);
  const exists = await query(`SELECT id FROM products WHERE id = $1`, [id]);
  if (!exists.rows[0]) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }
  const imageUrl = `/uploads/products/${req.file.filename}`;
  const maxOrder = await query<{ m: number | null }>(
    `SELECT MAX(sort_order) AS m FROM product_images WHERE product_id = $1`,
    [id],
  );
  const sortOrder = Number(maxOrder.rows[0]?.m ?? -1) + 1;
  await query(
    `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)`,
    [id, imageUrl, sortOrder],
  );
  const images = await syncProductCover(id);
  const result = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
  res.json({ ...result.rows[0], images, image_urls: images.map((i) => i.image_url) });
});

router.post("/products/:id/photos", upload.array("photos", 12), async (req, res) => {
  const id = Number(req.params.id);
  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    res.status(400).json({ error: "Envie ao menos uma imagem" });
    return;
  }
  const exists = await query(`SELECT id FROM products WHERE id = $1`, [id]);
  if (!exists.rows[0]) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }
  const maxOrder = await query<{ m: number | null }>(
    `SELECT MAX(sort_order) AS m FROM product_images WHERE product_id = $1`,
    [id],
  );
  let sortOrder = Number(maxOrder.rows[0]?.m ?? -1) + 1;
  for (const file of files) {
    const imageUrl = `/uploads/products/${file.filename}`;
    await query(
      `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)`,
      [id, imageUrl, sortOrder],
    );
    sortOrder += 1;
  }
  const images = await syncProductCover(id);
  const result = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
  res.json({ ...result.rows[0], images, image_urls: images.map((i) => i.image_url) });
});

router.get("/products/:id/images", async (req, res) => {
  const id = Number(req.params.id);
  res.json(await listProductImages(id));
});

router.delete("/products/:id/images/:imageId", async (req, res) => {
  const id = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  await query(`DELETE FROM product_images WHERE id = $1 AND product_id = $2`, [imageId, id]);
  const images = await syncProductCover(id);
  const result = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
  if (!result.rows[0]) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }
  res.json({ ...result.rows[0], images, image_urls: images.map((i) => i.image_url) });
});

router.post("/products/:id/images/:imageId/cover", async (req, res) => {
  const id = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  const img = await query<{ id: number }>(
    `SELECT id FROM product_images WHERE id = $1 AND product_id = $2`,
    [imageId, id],
  );
  if (!img.rows[0]) {
    res.status(404).json({ error: "Imagem não encontrada" });
    return;
  }
  await query(
    `UPDATE product_images SET sort_order = sort_order + 1 WHERE product_id = $1`,
    [id],
  );
  await query(`UPDATE product_images SET sort_order = 0 WHERE id = $1`, [imageId]);
  const images = await syncProductCover(id);
  const result = await query(`SELECT ${PRODUCT_SELECT} FROM product_catalog WHERE id = $1`, [id]);
  res.json({ ...result.rows[0], images, image_urls: images.map((i) => i.image_url) });
});

router.post("/banners/:id/photo", uploadBanner.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Arquivo obrigatório" });
    return;
  }
  const id = Number(req.params.id);
  const imageUrl = `/uploads/banners/${req.file.filename}`;
  await query(`UPDATE ad_banners SET image_url = $2, updated_at = NOW() WHERE id = $1`, [id, imageUrl]);
  const result = await query(
    `SELECT b.*, c.name AS customer_name,
            (b.impression_count * b.cost_per_impression_cents) AS total_cost_cents
     FROM ad_banners b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = $1`,
    [id],
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: "Banner não encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/stock/adjust", async (req, res) => {
  try {
    const { productId, delta, note } = req.body as {
      productId?: number;
      delta?: number;
      note?: string;
    };
    if (!productId || delta == null || delta === 0) {
      res.status(400).json({ error: "productId e delta são obrigatórios" });
      return;
    }
    const stock = await adjustStock({
      productId: Number(productId),
      delta: Number(delta),
      reason: "adjust",
      userId: req.user!.id,
      note,
    });
    res.json({ stock_qty: stock });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro no estoque" });
  }
});

router.get("/customers", async (_req, res) => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
            COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'paid') AS orders_count,
            COALESCE(SUM(o.total_cents) FILTER (WHERE o.status = 'paid'), 0) AS spent_cents,
            MAX(o.created_at) FILTER (WHERE o.status = 'paid') AS last_order_at,
            BOOL_OR(s.active AND s.expires_at > NOW()) AS has_active_sub
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     LEFT JOIN subscriptions s ON s.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );
  res.json(result.rows);
});

router.get("/orders", async (req, res) => {
  const channel = typeof req.query.channel === "string" ? req.query.channel : null;
  const result = await query(
    `SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method, o.payment_provider,
            o.total_cents, o.discount_cents, o.shipping_cents, o.created_at, o.paid_at,
            o.channel, o.notes, o.customer_phone, o.customer_document, o.shipping_address,
            u.name AS customer, u.email,
            o.guest_name, o.guest_email,
            json_agg(json_build_object(
              'product_id', p.id, 'name', p.name, 'quantity', oi.quantity, 'unit_price_cents', oi.unit_price_cents
            )) AS items
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE ($1::text IS NULL OR o.channel = $1)
     GROUP BY o.id, u.name, u.email
     ORDER BY o.created_at DESC
     LIMIT 100`,
    [channel],
  );
  res.json(result.rows);
});

/** Venda fora do site — abate estoque e registra pedido pago. */
router.post("/orders/offsite", async (req, res) => {
  try {
    const body = req.body as {
      productId?: number;
      quantity?: number;
      unitPriceCents?: number;
      channel?: string;
      customerName?: string;
      customerEmail?: string;
      notes?: string;
      grantAccess?: boolean;
    };
    if (!body.productId) {
      res.status(400).json({ error: "productId obrigatório" });
      return;
    }
    const qty = Math.max(1, Number(body.quantity ?? 1));
    const product = await query<{
      id: number;
      price_cents: number;
      promo_price_cents: number | null;
      stock_qty: number | null;
      access_days: number;
      name: string;
      type: string;
    }>(
      `SELECT id, price_cents, promo_price_cents, stock_qty, access_days, name, type
       FROM product_catalog WHERE id = $1 AND active = true`,
      [body.productId],
    );
    if (!product.rows[0]) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    const p = product.rows[0];
    const unit =
      body.unitPriceCents != null
        ? Number(body.unitPriceCents)
        : await resolveUnitPrice(p, qty);
    const total = unit * qty;

    await query("BEGIN");
    try {
      const order = await query<{ id: number }>(
        `INSERT INTO orders (user_id, guest_name, guest_email, status, total_cents, payment_method, channel, notes)
         VALUES (NULL, $1, $2, 'paid', $3, 'offsite', $4, $5) RETURNING id`,
        [
          body.customerName ?? null,
          body.customerEmail ?? null,
          total,
          body.channel ?? "offline",
          body.notes ?? null,
        ],
      );
      const orderId = order.rows[0].id;
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1,$2,$3,$4)`,
        [orderId, p.id, qty, unit],
      );
      await debitStock({
        productId: p.id,
        quantity: qty,
        reason: "offsite",
        orderId,
        userId: req.user!.id,
        note: body.notes,
      });
      await query("COMMIT");
      res.status(201).json({ orderId, total, unitPriceCents: unit });
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro na venda" });
  }
});

router.get("/subscriptions", async (_req, res) => {
  const result = await query(
    `SELECT s.id, u.name, u.email, p.name AS product, s.starts_at, s.expires_at, s.active
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     JOIN products p ON p.id = s.product_id
     ORDER BY s.expires_at DESC LIMIT 50`,
  );
  res.json(result.rows);
});

router.get("/stock/movements", async (req, res) => {
  const productId = req.query.productId ? Number(req.query.productId) : null;
  const result = await query(
    `SELECT m.*, p.name AS product_name, u.name AS created_by_name
     FROM stock_movements m
     JOIN products p ON p.id = m.product_id
     LEFT JOIN users u ON u.id = m.created_by
     WHERE ($1::int IS NULL OR m.product_id = $1)
     ORDER BY m.created_at DESC LIMIT 100`,
    [productId],
  );
  res.json(result.rows);
});

export default router;
