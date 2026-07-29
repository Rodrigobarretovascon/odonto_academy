import { query } from "../db/pool.js";
import { getVolumePrice, resolveUnitPrice, type PricedProduct } from "./stock.js";

export type VolumeTier = {
  min_qty: number;
  max_qty: number | null;
  unit_price_cents: number;
};

export async function listActiveTiers(productId: number): Promise<VolumeTier[]> {
  const scheduled = await query<VolumeTier>(
    `SELECT t.min_qty, t.max_qty, t.unit_price_cents
     FROM volume_price_tiers t
     JOIN volume_price_schedules s ON s.id = t.schedule_id
     WHERE s.product_id = $1
       AND s.active = true
       AND s.valid_from <= CURRENT_DATE
       AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)
     ORDER BY t.min_qty ASC`,
    [productId],
  );
  if (scheduled.rows.length) return scheduled.rows;

  const legacy = await query<VolumeTier>(
    `SELECT min_qty, NULL::int AS max_qty, unit_price_cents
     FROM product_volume_prices WHERE product_id = $1 ORDER BY min_qty ASC`,
    [productId],
  );
  return legacy.rows;
}

export async function quoteProduct(product: PricedProduct, qty: number) {
  const quantity = Math.max(1, qty);
  const tiers = await listActiveTiers(product.id);
  const unitPriceCents = await resolveUnitPrice(product, quantity);
  const volumePrice = await getVolumePrice(product.id, quantity);

  const currentTier =
    tiers
      .filter(
        (t) =>
          t.min_qty <= quantity && (t.max_qty == null || t.max_qty >= quantity),
      )
      .sort((a, b) => b.min_qty - a.min_qty)[0] ?? null;

  const nextTier = tiers.find((t) => t.min_qty > quantity) ?? null;

  let suggestion: {
    qty: number;
    unitPriceCents: number;
    lineTotalCents: number;
    currentLineTotalCents: number;
    savingsCents: number;
    message: string;
  } | null = null;

  if (nextTier) {
    const threshold = Math.ceil(nextTier.min_qty * 0.75);
    if (quantity >= threshold && quantity < nextTier.min_qty) {
      const suggestedQty = nextTier.min_qty;
      const suggestedUnit = nextTier.unit_price_cents;
      const currentLine = unitPriceCents * quantity;
      const suggestedLine = suggestedUnit * suggestedQty;
      const savings = currentLine - suggestedLine;
      suggestion = {
        qty: suggestedQty,
        unitPriceCents: suggestedUnit,
        lineTotalCents: suggestedLine,
        currentLineTotalCents: currentLine,
        savingsCents: savings,
        message:
          savings >= 0
            ? `A ${suggestedQty} un. você entra na próxima faixa (${formatTier(nextTier)}) e economiza em relação ao total atual.`
            : `Faltam ${suggestedQty - quantity} un. para a faixa a partir de ${nextTier.min_qty} (${formatMoney(suggestedUnit)}/un.).`,
      };
    }
  }

  return {
    productId: product.id,
    quantity,
    basePriceCents: product.price_cents,
    promoPriceCents: product.promo_price_cents,
    unitPriceCents,
    lineTotalCents: unitPriceCents * quantity,
    volumeApplied: volumePrice != null,
    currentTier,
    nextTier,
    tiers,
    suggestion,
  };
}

function formatTier(t: VolumeTier) {
  const range = t.max_qty != null ? `${t.min_qty}–${t.max_qty}` : `${t.min_qty}+`;
  return `${range} un. a ${formatMoney(t.unit_price_cents)}`;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function onlyDigits(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export type CouponRow = {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  min_order_cents: number;
};

export async function findCouponByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const r = await query<CouponRow>(
    `SELECT * FROM coupons WHERE upper(code) = $1`,
    [normalized],
  );
  return r.rows[0] ?? null;
}

export function validateCoupon(coupon: CouponRow, subtotalCents: number) {
  if (!coupon.active) return { ok: false as const, error: "Cupom inativo" };
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const from = new Date(`${String(coupon.valid_from).slice(0, 10)}T12:00:00`);
  if (today < from) return { ok: false as const, error: "Cupom ainda não válido" };
  if (coupon.valid_until) {
    const until = new Date(`${String(coupon.valid_until).slice(0, 10)}T12:00:00`);
    if (today > until) return { ok: false as const, error: "Cupom expirado" };
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { ok: false as const, error: "Cupom esgotado (limite de usos atingido)" };
  }
  if (subtotalCents < coupon.min_order_cents) {
    return {
      ok: false as const,
      error: `Pedido mínimo de ${(coupon.min_order_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    };
  }

  let discountCents = 0;
  if (coupon.discount_type === "percent") {
    discountCents = Math.round((subtotalCents * coupon.discount_value) / 100);
  } else {
    discountCents = coupon.discount_value;
  }
  discountCents = Math.max(0, Math.min(discountCents, subtotalCents));

  return {
    ok: true as const,
    coupon,
    discountCents,
    remainingUses:
      coupon.max_uses == null ? null : Math.max(0, coupon.max_uses - coupon.used_count),
  };
}
