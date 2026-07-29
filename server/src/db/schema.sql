-- GB Dental — schema normalizado
-- Domínios: users | products | prices | volume | inventory | orders | subscriptions

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin')),
  CONSTRAINT users_email_format CHECK (position('@' IN email) > 1)
);

CREATE SEQUENCE IF NOT EXISTS product_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT NOT NULL DEFAULT '',
  type VARCHAR(30) NOT NULL DEFAULT 'physical',
  access_days INTEGER NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  badge VARCHAR(100),
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  characteristics TEXT[] NOT NULL DEFAULT '{}',
  applications TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_code_unique UNIQUE (code),
  CONSTRAINT products_slug_unique UNIQUE (slug),
  CONSTRAINT products_type_check CHECK (type IN ('physical', 'subscription', 'digital')),
  CONSTRAINT products_access_days_check CHECK (access_days >= 0),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT products_slug_not_blank CHECK (length(trim(slug)) > 0)
);

CREATE TABLE IF NOT EXISTS product_prices (
  product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL,
  promo_price_cents INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_prices_price_check CHECK (price_cents >= 0),
  CONSTRAINT product_prices_promo_check CHECK (
    promo_price_cents IS NULL OR (promo_price_cents >= 0 AND promo_price_cents <= price_cents)
  )
);

CREATE TABLE IF NOT EXISTS product_inventory (
  product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER,
  track_stock BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_inventory_qty_check CHECK (quantity IS NULL OR quantity >= 0),
  CONSTRAINT product_inventory_track_consistency CHECK (
    (track_stock = false AND quantity IS NULL) OR (track_stock = true AND quantity IS NOT NULL)
  )
);

-- Preço por volume: tabela + faixas (cadastro próprio)
CREATE TABLE IF NOT EXISTS volume_price_schedules (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL DEFAULT 'Tabela volume',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT volume_sched_dates_check CHECK (valid_until IS NULL OR valid_until >= valid_from),
  CONSTRAINT volume_sched_name_check CHECK (length(trim(name)) > 0)
);

CREATE TABLE IF NOT EXISTS volume_price_tiers (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES volume_price_schedules(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER,
  unit_price_cents INTEGER NOT NULL,
  CONSTRAINT volume_tier_min_check CHECK (min_qty >= 1),
  CONSTRAINT volume_tier_max_check CHECK (max_qty IS NULL OR max_qty >= min_qty),
  CONSTRAINT volume_tier_price_check CHECK (unit_price_cents >= 0),
  CONSTRAINT volume_tier_unique UNIQUE (schedule_id, min_qty)
);

-- Legado (mantido para migração / fallback)
CREATE TABLE IF NOT EXISTS product_volume_prices (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  CONSTRAINT product_volume_min_qty_check CHECK (min_qty >= 1),
  CONSTRAINT product_volume_price_check CHECK (unit_price_cents >= 0),
  CONSTRAINT product_volume_unique UNIQUE (product_id, min_qty)
);

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
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_document_unique
  ON customers (document) WHERE document IS NOT NULL AND document <> '';

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
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(32),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  customer_phone VARCHAR(40),
  customer_document VARCHAR(30),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'manual',
  payment_provider VARCHAR(40),
  external_payment_id VARCHAR(120),
  total_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  channel VARCHAR(40) NOT NULL DEFAULT 'web',
  notes TEXT,
  shipping_address TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_status_check CHECK (status IN ('draft', 'pending', 'paid', 'cancelled', 'refunded')),
  CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN ('pending', 'awaiting_payment', 'paid', 'failed', 'refunded', 'cancelled')
  ),
  CONSTRAINT orders_payment_method_check CHECK (
    payment_method IS NULL OR payment_method IN (
      'credit', 'debit', 'pix', 'cash', 'transfer', 'demo', 'offsite', 'manual'
    )
  ),
  CONSTRAINT orders_payment_provider_check CHECK (
    payment_provider IS NULL OR payment_provider IN (
      'manual', 'demo', 'mercadopago', 'stripe', 'pagarme', 'asaas', 'pagseguro'
    )
  ),
  CONSTRAINT orders_total_check CHECK (total_cents >= 0),
  CONSTRAINT orders_discount_check CHECK (discount_cents >= 0),
  CONSTRAINT orders_shipping_check CHECK (shipping_cents >= 0),
  CONSTRAINT orders_channel_check CHECK (
    channel IN ('web', 'whatsapp', 'instagram', 'presencial', 'feira', 'offline', 'offsite', 'admin')
  )
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(32);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(40);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_document VARCHAR(30);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(40);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(40);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coupon_redemptions_discount_check CHECK (discount_cents >= 0),
  CONSTRAINT coupon_redemptions_order_unique UNIQUE (order_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique ON orders (order_number)
  WHERE order_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  CONSTRAINT order_items_qty_check CHECK (quantity >= 1),
  CONSTRAINT order_items_price_check CHECK (unit_price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_dates_check CHECK (expires_at > starts_at)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  delta INTEGER NOT NULL,
  reason VARCHAR(40) NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  inventory_count_id INTEGER,
  note TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stock_movements_delta_check CHECK (delta <> 0),
  CONSTRAINT stock_movements_reason_check CHECK (
    reason IN ('sale', 'offsite', 'adjust', 'purchase', 'return', 'inventory')
  )
);

-- Contagem de inventário com aprovação
CREATE TABLE IF NOT EXISTS inventory_counts (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  note TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_note TEXT,
  CONSTRAINT inventory_counts_status_check CHECK (
    status IN ('draft', 'pending', 'approved', 'rejected')
  )
);

CREATE TABLE IF NOT EXISTS inventory_count_lines (
  id SERIAL PRIMARY KEY,
  count_id INTEGER NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  system_qty INTEGER NOT NULL DEFAULT 0,
  counted_qty INTEGER,
  CONSTRAINT inventory_lines_unique UNIQUE (count_id, product_id),
  CONSTRAINT inventory_lines_system_check CHECK (system_qty >= 0),
  CONSTRAINT inventory_lines_counted_check CHECK (counted_qty IS NULL OR counted_qty >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_approvals (
  id SERIAL PRIMARY KEY,
  count_id INTEGER NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  actor_name VARCHAR(255) NOT NULL,
  actor_email VARCHAR(255) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_approvals_action_check CHECK (action IN ('approved', 'rejected'))
);

ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS inventory_count_id INTEGER;
ALTER TABLE stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_inventory_count_id_fkey;
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_inventory_count_id_fkey
  FOREIGN KEY (inventory_count_id) REFERENCES inventory_counts(id) ON DELETE SET NULL;

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
LEFT JOIN product_inventory inv ON inv.product_id = p.id;

CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products (active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products (type);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products (lower(name));
CREATE INDEX IF NOT EXISTS idx_product_prices_promo ON product_prices (promo_price_cents)
  WHERE promo_price_cents IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_inventory_low ON product_inventory (quantity)
  WHERE track_stock = true AND quantity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_volume_sched_product ON volume_price_schedules (product_id, active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_volume_tiers_schedule ON volume_price_tiers (schedule_id, min_qty DESC);
CREATE INDEX IF NOT EXISTS idx_product_volume_product ON product_volume_prices (product_id, min_qty DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders (channel);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions (expires_at)
  WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order ON stock_movements (order_id)
  WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_lines_count ON inventory_count_lines (count_id);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_count ON inventory_approvals (count_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
