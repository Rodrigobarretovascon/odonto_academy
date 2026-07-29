import { Router } from "express";
import { query } from "../db/pool.js";

const router = Router();

/** Banners ativos no período (público) */
router.get("/active", async (_req, res) => {
  try {
    const r = await query(
      `SELECT id, title, description, image_url, link_url, sort_order
       FROM ad_banners
       WHERE active = true
         AND valid_from <= CURRENT_DATE
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         AND image_url IS NOT NULL AND image_url <> ''
         AND image_url NOT LIKE '%/pending.svg'
       ORDER BY sort_order, id`,
    );
    res.json(r.rows);
  } catch (err) {
    console.error("GET /banners/active:", err);
    res.status(500).json({ error: "Erro ao listar banners" });
  }
});

/** Registra uma aparição (cobrança por impressão) */
router.post("/:id/impression", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const banner = await query<{
      id: number;
      customer_id: number | null;
      cost_per_impression_cents: number;
      active: boolean;
      valid_from: string;
      valid_until: string | null;
    }>(
      `SELECT id, customer_id, cost_per_impression_cents, active, valid_from, valid_until
       FROM ad_banners WHERE id = $1`,
      [id],
    );
    const b = banner.rows[0];
    if (!b || !b.active) {
      res.status(404).json({ error: "Banner indisponível" });
      return;
    }
    const cost = b.cost_per_impression_cents;
    await query("BEGIN");
    try {
      await query(
        `INSERT INTO ad_banner_impressions (banner_id, customer_id, cost_cents)
         VALUES ($1, $2, $3)`,
        [id, b.customer_id, cost],
      );
      await query(
        `UPDATE ad_banners SET impression_count = impression_count + 1, updated_at = NOW() WHERE id = $1`,
        [id],
      );
      await query("COMMIT");
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
    res.json({ ok: true, costCents: cost });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao registrar aparição" });
  }
});

export default router;
