import { Router } from "express";
import { query } from "../db/pool.js";

const router = Router();

const SELECT = `
  id, code, slug, name, subtitle, description, price_cents, promo_price_cents, type, access_days,
  image_url, badge, featured, stock_qty, characteristics, applications
`;

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT ${SELECT} FROM product_catalog WHERE active = true ORDER BY sort_order`,
    );
    const volumes = await query(
      `SELECT product_id, min_qty, unit_price_cents FROM product_volume_prices ORDER BY min_qty`,
    );
    const byProduct = new Map<number, { min_qty: number; unit_price_cents: number }[]>();
    for (const v of volumes.rows) {
      const list = byProduct.get(v.product_id) ?? [];
      list.push({ min_qty: v.min_qty, unit_price_cents: v.unit_price_cents });
      byProduct.set(v.product_id, list);
    }
    res.json(
      result.rows.map((p) => ({
        ...p,
        volume_prices: byProduct.get(p.id) ?? [],
        effective_price_cents:
          p.promo_price_cents != null && p.promo_price_cents < p.price_cents
            ? p.promo_price_cents
            : p.price_cents,
      })),
    );
  } catch (err) {
    console.error("GET /products:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao listar produtos" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const result = await query(
      `SELECT ${SELECT} FROM product_catalog WHERE slug = $1 AND active = true`,
      [req.params.slug],
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    const p = result.rows[0];
    const volumes = await query(
      `SELECT min_qty, unit_price_cents FROM product_volume_prices WHERE product_id = $1 ORDER BY min_qty`,
      [p.id],
    );
    res.json({
      ...p,
      volume_prices: volumes.rows,
      effective_price_cents:
        p.promo_price_cents != null && p.promo_price_cents < p.price_cents
          ? p.promo_price_cents
          : p.price_cents,
    });
  } catch (err) {
    console.error("GET /products/:slug:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao buscar produto" });
  }
});

export default router;
