import { query } from "./pool.js";

async function columnExists(table: string, column: string) {
  const r = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    [table, column],
  );
  return Boolean(r.rows[0]?.exists);
}

async function tableExists(table: string) {
  const r = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [table],
  );
  return Boolean(r.rows[0]?.exists);
}

/** Migrations idempotentes: normaliza produto / preço / estoque + índices. */
export async function migrateSchema() {
  await query(`CREATE SEQUENCE IF NOT EXISTS product_code_seq START 1`);

  // --- products.code ---
  // Sem tabela base (schema.sql ainda não rodou), pula — ensureDatabase / db:init criam depois.
  if (await tableExists("products")) {
    if (!(await columnExists("products", "code"))) {
      await query(`ALTER TABLE products ADD COLUMN code VARCHAR(32)`);
      await query(`
        UPDATE products SET code = 'GB-' || lpad(id::text, 5, '0')
        WHERE code IS NULL OR code = ''
      `);
      const maxId = await query<{ m: string | null }>(`SELECT MAX(id)::text AS m FROM products`);
      const start = Number(maxId.rows[0]?.m ?? 0) + 1;
      await query(`SELECT setval('product_code_seq', GREATEST($1, 1), true)`, [start]);
      await query(`ALTER TABLE products ALTER COLUMN code SET NOT NULL`);
    }
    await query(`
      DO $$ BEGIN
        ALTER TABLE products ADD CONSTRAINT products_code_unique UNIQUE (code);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN duplicate_table THEN NULL;
      END $$
    `);
  }

  // --- product_prices ---
  await query(`
    CREATE TABLE IF NOT EXISTS product_prices (
      product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
      price_cents INTEGER NOT NULL DEFAULT 0,
      promo_price_cents INTEGER,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT product_prices_price_check CHECK (price_cents >= 0),
      CONSTRAINT product_prices_promo_check CHECK (
        promo_price_cents IS NULL OR (promo_price_cents >= 0 AND promo_price_cents <= price_cents)
      )
    )
  `);

  // --- product_inventory ---
  await query(`
    CREATE TABLE IF NOT EXISTS product_inventory (
      product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER,
      track_stock BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT product_inventory_qty_check CHECK (quantity IS NULL OR quantity >= 0)
    )
  `);

  // Backfill from legacy columns on products
  if (await columnExists("products", "price_cents")) {
    await query(`
      INSERT INTO product_prices (product_id, price_cents, promo_price_cents)
      SELECT id, price_cents, promo_price_cents FROM products
      ON CONFLICT (product_id) DO UPDATE SET
        price_cents = EXCLUDED.price_cents,
        promo_price_cents = COALESCE(product_prices.promo_price_cents, EXCLUDED.promo_price_cents),
        updated_at = NOW()
    `);
  }
  if (await columnExists("products", "stock_qty")) {
    await query(`
      INSERT INTO product_inventory (product_id, quantity, track_stock)
      SELECT id, stock_qty, (stock_qty IS NOT NULL)
      FROM products
      ON CONFLICT (product_id) DO UPDATE SET
        quantity = COALESCE(product_inventory.quantity, EXCLUDED.quantity),
        track_stock = COALESCE(product_inventory.track_stock, EXCLUDED.track_stock),
        updated_at = NOW()
    `);
  }

  // Ensure every product has price + inventory rows
  await query(`
    INSERT INTO product_prices (product_id, price_cents)
    SELECT p.id, 0 FROM products p
    LEFT JOIN product_prices pr ON pr.product_id = p.id
    WHERE pr.product_id IS NULL
  `);
  await query(`
    INSERT INTO product_inventory (product_id, quantity, track_stock)
    SELECT p.id, NULL, false FROM products p
    LEFT JOIN product_inventory i ON i.product_id = p.id
    WHERE i.product_id IS NULL
  `);

  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS characteristics TEXT[] NOT NULL DEFAULT '{}'`);
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS applications TEXT[] NOT NULL DEFAULT '{}'`);
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(40) NOT NULL DEFAULT 'web'`);
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT`);

  await query(`
    CREATE TABLE IF NOT EXISTS product_volume_prices (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      min_qty INTEGER NOT NULL CHECK (min_qty >= 1),
      unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
      UNIQUE (product_id, min_qty)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id),
      delta INTEGER NOT NULL,
      reason VARCHAR(40) NOT NULL,
      order_id INTEGER REFERENCES orders(id),
      note TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1`);

  // Volume price schedules + tiers
  await query(`
    CREATE TABLE IF NOT EXISTS volume_price_schedules (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL DEFAULT 'Tabela volume',
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_until DATE,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS volume_price_tiers (
      id SERIAL PRIMARY KEY,
      schedule_id INTEGER NOT NULL REFERENCES volume_price_schedules(id) ON DELETE CASCADE,
      min_qty INTEGER NOT NULL,
      max_qty INTEGER,
      unit_price_cents INTEGER NOT NULL,
      CONSTRAINT volume_tier_unique UNIQUE (schedule_id, min_qty)
    )
  `);

  // Backfill schedules from legacy product_volume_prices (once)
  if (await tableExists("product_volume_prices")) {
    await query(`
      INSERT INTO volume_price_schedules (product_id, name, valid_from, active)
      SELECT DISTINCT v.product_id, 'Atacado', CURRENT_DATE, true
      FROM product_volume_prices v
      WHERE NOT EXISTS (
        SELECT 1 FROM volume_price_schedules s WHERE s.product_id = v.product_id
      )
    `);
    await query(`
      INSERT INTO volume_price_tiers (schedule_id, min_qty, max_qty, unit_price_cents)
      SELECT s.id, v.min_qty, NULL, v.unit_price_cents
      FROM product_volume_prices v
      JOIN volume_price_schedules s ON s.product_id = v.product_id AND s.name IN ('Atacado', 'Migrado')
      WHERE NOT EXISTS (
        SELECT 1 FROM volume_price_tiers t
        WHERE t.schedule_id = s.id AND t.min_qty = v.min_qty
      )
    `);
    await query(`UPDATE volume_price_schedules SET name = 'Atacado' WHERE name = 'Migrado'`);
  }

  // Inventory counts
  await query(`
    CREATE TABLE IF NOT EXISTS inventory_counts (
      id SERIAL PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      note TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      submitted_at TIMESTAMPTZ,
      approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      approved_at TIMESTAMPTZ,
      approval_note TEXT
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS inventory_count_lines (
      id SERIAL PRIMARY KEY,
      count_id INTEGER NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      system_qty INTEGER NOT NULL DEFAULT 0,
      counted_qty INTEGER,
      UNIQUE (count_id, product_id)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS inventory_approvals (
      id SERIAL PRIMARY KEY,
      count_id INTEGER NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
      action VARCHAR(20) NOT NULL,
      actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      actor_name VARCHAR(255) NOT NULL,
      actor_email VARCHAR(255) NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS inventory_count_id INTEGER`);

  // Customers (cadastro de venda — separado de users)
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(40),
      document VARCHAR(30),
      notes TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true`);
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS customers_document_unique
    ON customers (document) WHERE document IS NOT NULL AND document <> ''
  `);

  // Coupons
  await query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(40) NOT NULL,
      description VARCHAR(255),
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
      discount_value INTEGER NOT NULL,
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_until DATE,
      active BOOLEAN NOT NULL DEFAULT true,
      min_order_cents INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT coupons_code_unique UNIQUE (code),
      CONSTRAINT coupons_type_check CHECK (discount_type IN ('percent', 'fixed')),
      CONSTRAINT coupons_value_check CHECK (discount_value > 0),
      CONSTRAINT coupons_uses_check CHECK (max_uses IS NULL OR max_uses >= 1),
      CONSTRAINT coupons_used_check CHECK (used_count >= 0),
      CONSTRAINT coupons_min_order_check CHECK (min_order_cents >= 0),
      CONSTRAINT coupons_dates_check CHECK (valid_until IS NULL OR valid_until >= valid_from)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id SERIAL PRIMARY KEY,
      coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      discount_cents INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT coupon_redemptions_discount_check CHECK (discount_cents >= 0),
      CONSTRAINT coupon_redemptions_order_unique UNIQUE (order_id)
    )
  `);

  // Banners publicitários
  await query(`
    CREATE TABLE IF NOT EXISTS ad_banners (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(500) NOT NULL,
      link_url VARCHAR(500),
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      cost_per_impression_cents INTEGER NOT NULL DEFAULT 0,
      impression_count INTEGER NOT NULL DEFAULT 0,
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_until DATE,
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT ad_banners_cost_check CHECK (cost_per_impression_cents >= 0),
      CONSTRAINT ad_banners_impressions_check CHECK (impression_count >= 0),
      CONSTRAINT ad_banners_dates_check CHECK (valid_until IS NULL OR valid_until >= valid_from)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS ad_banner_impressions (
      id SERIAL PRIMARY KEY,
      banner_id INTEGER NOT NULL REFERENCES ad_banners(id) ON DELETE CASCADE,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      cost_cents INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT ad_banner_impressions_cost_check CHECK (cost_cents >= 0)
    )
  `);

  // Custos / despesas do negócio (compras, marketing, etc.)
  await query(`
    CREATE TABLE IF NOT EXISTS business_expenses (
      id SERIAL PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'geral',
      amount_cents INTEGER NOT NULL,
      spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT business_expenses_amount_check CHECK (amount_cents > 0)
    )
  `);
  await query(
    `CREATE INDEX IF NOT EXISTS idx_business_expenses_spent_on ON business_expenses (spent_on DESC)`,
  );
  // per_unit = custo a cada unidade vendida; fixed = gasto único (não multiplica)
  await query(`ALTER TABLE business_expenses ADD COLUMN IF NOT EXISTS cost_mode VARCHAR(20) NOT NULL DEFAULT 'per_unit'`);
  await query(`
    DO $$ BEGIN
      ALTER TABLE business_expenses
        ADD CONSTRAINT business_expenses_cost_mode_check
        CHECK (cost_mode IN ('per_unit', 'fixed'));
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `);
  // Categorias tipicamente por unidade
  await query(`
    UPDATE business_expenses
    SET cost_mode = 'per_unit'
    WHERE category IN ('produto', 'embalagem', 'brinde', 'frete', 'compra')
      AND (cost_mode IS NULL OR cost_mode = 'per_unit')
  `);

  // Valores do resumo financeiro editáveis no painel (substituem o cálculo automático quando enabled)
  await query(`
    CREATE TABLE IF NOT EXISTS finance_dashboard_overrides (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      enabled BOOLEAN NOT NULL DEFAULT false,
      revenue_cents INTEGER NOT NULL DEFAULT 0,
      costs_cents INTEGER NOT NULL DEFAULT 0,
      orders_count INTEGER NOT NULL DEFAULT 0,
      active_subscribers INTEGER NOT NULL DEFAULT 0,
      month_revenue_cents INTEGER NOT NULL DEFAULT 0,
      month_costs_cents INTEGER NOT NULL DEFAULT 0,
      month_orders_count INTEGER NOT NULL DEFAULT 0,
      banner_revenue_cents INTEGER NOT NULL DEFAULT 0,
      discounts_cents INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT finance_dashboard_overrides_nonneg CHECK (
        revenue_cents >= 0 AND costs_cents >= 0 AND orders_count >= 0
        AND active_subscribers >= 0 AND month_revenue_cents >= 0
        AND month_costs_cents >= 0 AND month_orders_count >= 0
        AND banner_revenue_cents >= 0 AND discounts_cents >= 0
      )
    )
  `);
  await query(`
    INSERT INTO finance_dashboard_overrides (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `);

  // Orders — sales order + payment gateway prep
  const orderCols: Array<[string, string]> = [
    ["order_number", "VARCHAR(32)"],
    ["customer_phone", "VARCHAR(40)"],
    ["customer_document", "VARCHAR(30)"],
    ["customer_id", "INTEGER"],
    ["coupon_id", "INTEGER"],
    ["coupon_code", "VARCHAR(40)"],
    ["coupon_discount_cents", "INTEGER NOT NULL DEFAULT 0"],
    ["payment_status", "VARCHAR(30) NOT NULL DEFAULT 'pending'"],
    ["payment_provider", "VARCHAR(40)"],
    ["external_payment_id", "VARCHAR(120)"],
    ["discount_cents", "INTEGER NOT NULL DEFAULT 0"],
    ["shipping_cents", "INTEGER NOT NULL DEFAULT 0"],
    ["shipping_address", "TEXT"],
    ["created_by", "INTEGER"],
    ["paid_at", "TIMESTAMPTZ"],
    ["updated_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()"],
  ];
  for (const [col, typ] of orderCols) {
    await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col} ${typ}`);
  }

  await query(`
    UPDATE orders SET payment_status = 'paid', paid_at = COALESCE(paid_at, created_at)
    WHERE status = 'paid' AND (payment_status IS NULL OR payment_status = 'pending')
  `);
  await query(`
    UPDATE orders SET order_number = 'GB-PED-' || lpad(id::text, 5, '0')
    WHERE order_number IS NULL
  `);
  await query(`
    SELECT setval(
      'order_number_seq',
      GREATEST(COALESCE((SELECT MAX(id) FROM orders), 0), 1),
      true
    )
  `);

  // Relax / refresh order CHECKs for new statuses/channels/methods
  await query(`
    DO $$ BEGIN
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
        CHECK (status IN ('draft', 'pending', 'paid', 'cancelled', 'refunded'));
    EXCEPTION WHEN others THEN NULL;
    END $$
  `);
  await query(`
    DO $$ BEGIN
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_channel_check;
      ALTER TABLE orders ADD CONSTRAINT orders_channel_check
        CHECK (channel IN ('web', 'whatsapp', 'instagram', 'presencial', 'feira', 'offline', 'offsite', 'admin'));
    EXCEPTION WHEN others THEN NULL;
    END $$
  `);

  // Drop legacy denormalized columns after backfill (safe if already dropped)
  for (const col of ["price_cents", "promo_price_cents", "stock_qty"]) {
    if (await columnExists("products", col)) {
      await query(`ALTER TABLE products DROP COLUMN IF EXISTS ${col}`);
    }
  }

  await query(`
    CREATE OR REPLACE VIEW product_catalog AS
    SELECT
      p.id,
      p.code,
      p.slug,
      p.name,
      p.subtitle,
      p.description,
      p.type,
      p.access_days,
      p.image_url,
      p.badge,
      p.featured,
      p.active,
      p.sort_order,
      p.characteristics,
      p.applications,
      p.created_at,
      p.updated_at,
      COALESCE(pr.price_cents, 0) AS price_cents,
      pr.promo_price_cents,
      CASE WHEN inv.track_stock THEN inv.quantity ELSE NULL END AS stock_qty,
      COALESCE(inv.track_stock, false) AS track_stock
    FROM products p
    LEFT JOIN product_prices pr ON pr.product_id = p.id
    LEFT JOIN product_inventory inv ON inv.product_id = p.id
  `);

  // Galeria / carrossel de imagens por produto
  await query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(
    `CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id, sort_order, id)`,
  );
  // Backfill: capa atual vira primeira imagem do carrossel
  await query(`
    INSERT INTO product_images (product_id, image_url, sort_order)
    SELECT p.id, p.image_url, 0
    FROM products p
    WHERE p.image_url IS NOT NULL AND p.image_url <> ''
      AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products (active, sort_order, id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_type ON products (type)`,
    `CREATE INDEX IF NOT EXISTS idx_products_code ON products (code)`,
    `CREATE INDEX IF NOT EXISTS idx_product_prices_promo ON product_prices (promo_price_cents) WHERE promo_price_cents IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_product_inventory_low ON product_inventory (quantity) WHERE track_stock = true`,
    `CREATE INDEX IF NOT EXISTS idx_product_volume_product ON product_volume_prices (product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_volume_sched_product ON volume_price_schedules (product_id, active)`,
    `CREATE INDEX IF NOT EXISTS idx_volume_tiers_schedule ON volume_price_tiers (schedule_id, min_qty DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders (channel)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status, created_at DESC)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique ON orders (order_number) WHERE order_number IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts (status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_inventory_lines_count ON inventory_count_lines (count_id)`,
    `CREATE INDEX IF NOT EXISTS idx_inventory_approvals_count ON inventory_approvals (count_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions (expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)`,
    `CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (lower(name))`,
    `CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (active, valid_from, valid_until)`,
    `CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions (coupon_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ad_banners_active ON ad_banners (active, valid_from, valid_until)`,
    `CREATE INDEX IF NOT EXISTS idx_ad_banner_impressions_banner ON ad_banner_impressions (banner_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_ad_banner_impressions_customer ON ad_banner_impressions (customer_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens (token)`,
    `CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens (user_id)`,
  ];
  for (const sql of indexes) {
    await query(sql);
  }

  if (await tableExists("users")) {
    await query(`
      DO $$ BEGIN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
  }
}

export async function nextProductCode() {
  const r = await query<{ code: string }>(
    `SELECT 'GB-' || lpad(nextval('product_code_seq')::text, 5, '0') AS code`,
  );
  return r.rows[0].code;
}

export async function nextOrderNumber() {
  const r = await query<{ n: string }>(
    `SELECT 'GB-PED-' || lpad(nextval('order_number_seq')::text, 5, '0') AS n`,
  );
  return r.rows[0].n;
}

export async function peekOrderNumber() {
  const r = await query<{ n: string }>(
    `SELECT 'GB-PED-' || lpad(
       (COALESCE((SELECT last_value FROM order_number_seq), 1)
        + CASE WHEN (SELECT is_called FROM order_number_seq) THEN 1 ELSE 0 END
       )::text,
       5, '0'
     ) AS n`,
  );
  return r.rows[0].n;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
