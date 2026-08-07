import { Router } from "express";
import { query } from "../db/pool.js";

const router = Router();

const SELECT = `
  id, code, slug, name, subtitle, description, price_cents, promo_price_cents, type, access_days,
  image_url, badge, featured, stock_qty, characteristics, applications
`;

async function imagesByProductIds(ids: number[]) {
  const map = new Map<number, Array<{ id: number; image_url: string }>>();
  if (ids.length === 0) return map;
  const r = await query<{ id: number; product_id: number; image_url: string }>(
    `SELECT id, product_id, image_url FROM product_images
     WHERE product_id = ANY($1::int[])
     ORDER BY sort_order ASC, id ASC`,
    [ids],
  );
  for (const row of r.rows) {
    const list = map.get(row.product_id) ?? [];
    list.push({ id: row.id, image_url: row.image_url });
    map.set(row.product_id, list);
  }
  return map;
}

function withImages(p: Record<string, unknown>, images: Array<{ id: number; image_url: string }>) {
  const image_urls =
    images.length > 0 ? images.map((i) => i.image_url) : p.image_url ? [String(p.image_url)] : [];
  return {
    ...p,
    images,
    image_urls,
    image_url: image_urls[0] ?? p.image_url ?? "",
  };
}

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
    const imagesMap = await imagesByProductIds(result.rows.map((p) => Number(p.id)));
    res.json(
      result.rows.map((p) => {
        const images = imagesMap.get(Number(p.id)) ?? [];
        return {
          ...withImages(p, images),
          volume_prices: byProduct.get(p.id) ?? [],
          effective_price_cents:
            p.promo_price_cents != null && p.promo_price_cents < p.price_cents
              ? p.promo_price_cents
              : p.price_cents,
        };
      }),
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
    const imagesMap = await imagesByProductIds([Number(p.id)]);
    const images = imagesMap.get(Number(p.id)) ?? [];
    res.json({
      ...withImages(p, images),
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
