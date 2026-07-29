import { query } from "../db/pool.js";

export type PricedProduct = {
  id: number;
  price_cents: number;
  promo_price_cents: number | null;
  stock_qty: number | null;
  access_days: number;
  name: string;
  type: string;
};

export async function getVolumePrice(productId: number, qty: number): Promise<number | null> {
  const scheduled = await query<{ unit_price_cents: number }>(
    `SELECT t.unit_price_cents
     FROM volume_price_tiers t
     JOIN volume_price_schedules s ON s.id = t.schedule_id
     WHERE s.product_id = $1
       AND s.active = true
       AND s.valid_from <= CURRENT_DATE
       AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)
       AND t.min_qty <= $2
       AND (t.max_qty IS NULL OR t.max_qty >= $2)
     ORDER BY t.min_qty DESC
     LIMIT 1`,
    [productId, qty],
  );
  if (scheduled.rows[0]) return scheduled.rows[0].unit_price_cents;

  const legacy = await query<{ unit_price_cents: number }>(
    `SELECT unit_price_cents FROM product_volume_prices
     WHERE product_id = $1 AND min_qty <= $2
     ORDER BY min_qty DESC LIMIT 1`,
    [productId, qty],
  );
  return legacy.rows[0]?.unit_price_cents ?? null;
}

export async function resolveUnitPrice(product: PricedProduct, qty: number): Promise<number> {
  const volume = await getVolumePrice(product.id, qty);
  if (volume != null) return volume;
  if (product.promo_price_cents != null && product.promo_price_cents < product.price_cents) {
    return product.promo_price_cents;
  }
  return product.price_cents;
}

export async function debitStock(opts: {
  productId: number;
  quantity: number;
  reason: string;
  orderId?: number;
  userId?: number;
  note?: string;
}) {
  const { productId, quantity, reason, orderId, userId, note } = opts;
  const current = await query<{ quantity: number | null; track_stock: boolean }>(
    `SELECT quantity, track_stock FROM product_inventory WHERE product_id = $1 FOR UPDATE`,
    [productId],
  );
  const row = current.rows[0];
  if (!row || !row.track_stock || row.quantity == null) {
    return; // sem controle de estoque
  }
  if (row.quantity < quantity) {
    throw new Error(`Estoque insuficiente para o produto #${productId}`);
  }
  await query(
    `UPDATE product_inventory
     SET quantity = quantity - $1, updated_at = NOW()
     WHERE product_id = $2`,
    [quantity, productId],
  );
  await query(
    `INSERT INTO stock_movements (product_id, delta, reason, order_id, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [productId, -quantity, reason, orderId ?? null, note ?? null, userId ?? null],
  );
}

export async function adjustStock(opts: {
  productId: number;
  delta: number;
  reason: string;
  userId?: number;
  note?: string;
  inventoryCountId?: number;
}) {
  const { productId, delta, reason, userId, note, inventoryCountId } = opts;
  const current = await query<{ quantity: number | null; track_stock: boolean }>(
    `SELECT quantity, track_stock FROM product_inventory WHERE product_id = $1 FOR UPDATE`,
    [productId],
  );
  let row = current.rows[0];
  if (!row) {
    await query(
      `INSERT INTO product_inventory (product_id, quantity, track_stock)
       VALUES ($1, GREATEST($2, 0), true)`,
      [productId, delta],
    );
    row = { quantity: Math.max(delta, 0), track_stock: true };
  }
  const base = row.track_stock && row.quantity != null ? row.quantity : 0;
  const next = base + delta;
  if (next < 0) throw new Error("Estoque não pode ficar negativo");
  await query(
    `UPDATE product_inventory
     SET quantity = $1, track_stock = true, updated_at = NOW()
     WHERE product_id = $2`,
    [next, productId],
  );
  await query(
    `INSERT INTO stock_movements (product_id, delta, reason, note, created_by, inventory_count_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [productId, delta, reason, note ?? null, userId ?? null, inventoryCountId ?? null],
  );
  return next;
}

export async function upsertPrice(productId: number, priceCents: number, promoCents: number | null) {
  await query(
    `INSERT INTO product_prices (product_id, price_cents, promo_price_cents)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id) DO UPDATE SET
       price_cents = EXCLUDED.price_cents,
       promo_price_cents = EXCLUDED.promo_price_cents,
       updated_at = NOW()`,
    [productId, priceCents, promoCents],
  );
}

export async function upsertInventory(
  productId: number,
  stockQty: number | null,
) {
  const track = stockQty != null;
  await query(
    `INSERT INTO product_inventory (product_id, quantity, track_stock)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id) DO UPDATE SET
       quantity = EXCLUDED.quantity,
       track_stock = EXCLUDED.track_stock,
       updated_at = NOW()`,
    [productId, stockQty, track],
  );
}
