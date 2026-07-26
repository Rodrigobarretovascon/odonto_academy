import { Router } from "express";
import { query } from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await query(
    `SELECT id, slug, name, subtitle, description, price_cents, type, access_days, image_url, badge, featured
     FROM products WHERE active = true ORDER BY sort_order`,
  );
  res.json(result.rows);
});

router.get("/:slug", async (req, res) => {
  const result = await query(
    `SELECT id, slug, name, subtitle, description, price_cents, type, access_days, image_url, badge, featured
     FROM products WHERE slug = $1 AND active = true`,
    [req.params.slug],
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

export default router;
