import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db/pool.js";
import { adjustStock, debitStock, resolveUnitPrice } from "../services/stock.js";
import { nextOrderNumber, peekOrderNumber } from "../db/migrate.js";
import {
  findCouponByCode,
  onlyDigits,
  quoteProduct,
  validateCoupon,
} from "../services/pricing.js";
import { lookupPublicDocument } from "../services/document-lookup.js";
import { sendBannerExtractPdf } from "../services/banner-extract-pdf.js";

const router = Router();

type TierInput = { min_qty: number; max_qty?: number | null; unit_price_cents: number };

async function loadSchedule(id: number) {
  const schedule = await query(
    `SELECT s.*, p.code AS product_code, p.name AS product_name
     FROM volume_price_schedules s
     JOIN products p ON p.id = s.product_id
     WHERE s.id = $1`,
    [id],
  );
  if (!schedule.rows[0]) return null;
  const tiers = await query(
    `SELECT id, min_qty, max_qty, unit_price_cents
     FROM volume_price_tiers WHERE schedule_id = $1 ORDER BY min_qty`,
    [id],
  );
  return { ...schedule.rows[0], tiers: tiers.rows };
}

/** —— Preço por volume —— */
router.get("/volume-prices", async (_req, res) => {
  const schedules = await query(
    `SELECT s.*, p.code AS product_code, p.name AS product_name
     FROM volume_price_schedules s
     JOIN products p ON p.id = s.product_id
     ORDER BY s.active DESC, s.valid_from DESC, s.id DESC`,
  );
  const tiers = await query(
    `SELECT id, schedule_id, min_qty, max_qty, unit_price_cents
     FROM volume_price_tiers ORDER BY min_qty`,
  );
  const bySched = new Map<number, typeof tiers.rows>();
  for (const t of tiers.rows) {
    const list = bySched.get(t.schedule_id) ?? [];
    list.push(t);
    bySched.set(t.schedule_id, list);
  }
  res.json(schedules.rows.map((s) => ({ ...s, tiers: bySched.get(s.id) ?? [] })));
});

router.post("/volume-prices", async (req, res) => {
  try {
    const body = req.body as {
      product_id?: number;
      name?: string;
      valid_from?: string;
      valid_until?: string | null;
      active?: boolean;
      tiers?: TierInput[];
    };
    if (!body.product_id) {
      res.status(400).json({ error: "Produto obrigatório" });
      return;
    }
    if (!Array.isArray(body.tiers) || body.tiers.length === 0) {
      res.status(400).json({ error: "Informe ao menos uma faixa de quantidade" });
      return;
    }
    const inserted = await query<{ id: number }>(
      `INSERT INTO volume_price_schedules (product_id, name, valid_from, valid_until, active)
       VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, COALESCE($5, true))
       RETURNING id`,
      [
        body.product_id,
        body.name?.trim() || "Tabela volume",
        body.valid_from ?? null,
        body.valid_until || null,
        body.active !== false,
      ],
    );
    const id = inserted.rows[0].id;
    for (const t of body.tiers) {
      await query(
        `INSERT INTO volume_price_tiers (schedule_id, min_qty, max_qty, unit_price_cents)
         VALUES ($1, $2, $3, $4)`,
        [id, Number(t.min_qty), t.max_qty != null ? Number(t.max_qty) : null, Number(t.unit_price_cents)],
      );
    }
    res.status(201).json(await loadSchedule(id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao salvar tabela" });
  }
});

router.patch("/volume-prices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as {
      name?: string;
      valid_from?: string;
      valid_until?: string | null;
      active?: boolean;
      tiers?: TierInput[];
    };
    const current = await loadSchedule(id);
    if (!current) {
      res.status(404).json({ error: "Tabela não encontrada" });
      return;
    }
    await query(
      `UPDATE volume_price_schedules SET
         name = COALESCE($2, name),
         valid_from = COALESCE($3::date, valid_from),
         valid_until = CASE WHEN $4::text = '__keep' THEN valid_until ELSE NULLIF($4, '')::date END,
         active = COALESCE($5, active),
         updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        body.name ?? null,
        body.valid_from ?? null,
        body.valid_until === undefined ? "__keep" : body.valid_until ?? "",
        body.active ?? null,
      ],
    );
    if (Array.isArray(body.tiers)) {
      await query(`DELETE FROM volume_price_tiers WHERE schedule_id = $1`, [id]);
      for (const t of body.tiers) {
        await query(
          `INSERT INTO volume_price_tiers (schedule_id, min_qty, max_qty, unit_price_cents)
           VALUES ($1, $2, $3, $4)`,
          [id, Number(t.min_qty), t.max_qty != null ? Number(t.max_qty) : null, Number(t.unit_price_cents)],
        );
      }
    }
    res.json(await loadSchedule(id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar" });
  }
});

router.delete("/volume-prices/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query(`DELETE FROM volume_price_schedules WHERE id = $1`, [id]);
  res.json({ ok: true });
});

/** —— Inventário com aprovação —— */
async function loadCount(id: number) {
  const count = await query(
    `SELECT c.*,
            cu.name AS created_by_name, cu.email AS created_by_email,
            au.name AS approved_by_name, au.email AS approved_by_email
     FROM inventory_counts c
     LEFT JOIN users cu ON cu.id = c.created_by
     LEFT JOIN users au ON au.id = c.approved_by
     WHERE c.id = $1`,
    [id],
  );
  if (!count.rows[0]) return null;
  const lines = await query(
    `SELECT l.*, p.code AS product_code, p.name AS product_name
     FROM inventory_count_lines l
     JOIN products p ON p.id = l.product_id
     WHERE l.count_id = $1
     ORDER BY p.name`,
    [id],
  );
  const approvals = await query(
    `SELECT * FROM inventory_approvals WHERE count_id = $1 ORDER BY created_at DESC`,
    [id],
  );
  return { ...count.rows[0], lines: lines.rows, approvals: approvals.rows };
}

router.get("/inventory/snapshot", async (_req, res) => {
  const rows = await query(
    `SELECT id, code, name, stock_qty, track_stock
     FROM product_catalog
     WHERE track_stock = true
     ORDER BY name`,
  );
  res.json(rows.rows);
});

router.get("/inventory/counts", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const rows = await query(
    `SELECT c.*,
            cu.name AS created_by_name,
            au.name AS approved_by_name,
            (SELECT COUNT(*) FROM inventory_count_lines l WHERE l.count_id = c.id) AS lines_count
     FROM inventory_counts c
     LEFT JOIN users cu ON cu.id = c.created_by
     LEFT JOIN users au ON au.id = c.approved_by
     WHERE ($1::text IS NULL OR c.status = $1)
     ORDER BY c.created_at DESC
     LIMIT 100`,
    [status],
  );
  res.json(rows.rows);
});

router.get("/inventory/counts/:id", async (req, res) => {
  const data = await loadCount(Number(req.params.id));
  if (!data) {
    res.status(404).json({ error: "Inventário não encontrado" });
    return;
  }
  res.json(data);
});

router.post("/inventory/counts", async (req, res) => {
  try {
    const body = req.body as { note?: string; productIds?: number[] };
    const snapshot = await query<{ id: number; stock_qty: number }>(
      `SELECT id, stock_qty FROM product_catalog
       WHERE track_stock = true
         AND ($1::int[] IS NULL OR id = ANY($1))
       ORDER BY name`,
      [body.productIds?.length ? body.productIds : null],
    );
    if (!snapshot.rows.length) {
      res.status(400).json({ error: "Nenhum produto com estoque controlado" });
      return;
    }
    const created = await query<{ id: number }>(
      `INSERT INTO inventory_counts (status, note, created_by)
       VALUES ('draft', $1, $2) RETURNING id`,
      [body.note ?? null, req.user!.id],
    );
    const countId = created.rows[0].id;
    for (const p of snapshot.rows) {
      await query(
        `INSERT INTO inventory_count_lines (count_id, product_id, system_qty, counted_qty)
         VALUES ($1, $2, $3, $3)`,
        [countId, p.id, p.stock_qty ?? 0],
      );
    }
    res.status(201).json(await loadCount(countId));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao criar inventário" });
  }
});

router.patch("/inventory/counts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as {
      note?: string;
      lines?: Array<{ product_id: number; counted_qty: number }>;
    };
    const current = await query<{ status: string }>(`SELECT status FROM inventory_counts WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Inventário não encontrado" });
      return;
    }
    if (!["draft", "rejected"].includes(current.rows[0].status)) {
      res.status(400).json({ error: "Só rascunhos/rejeitados podem ser editados" });
      return;
    }
    if (body.note !== undefined) {
      await query(`UPDATE inventory_counts SET note = $2 WHERE id = $1`, [id, body.note]);
    }
    if (Array.isArray(body.lines)) {
      for (const line of body.lines) {
        await query(
          `UPDATE inventory_count_lines SET counted_qty = $3
           WHERE count_id = $1 AND product_id = $2`,
          [id, line.product_id, Number(line.counted_qty)],
        );
      }
    }
    if (current.rows[0].status === "rejected") {
      await query(`UPDATE inventory_counts SET status = 'draft' WHERE id = $1`, [id]);
    }
    res.json(await loadCount(id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar" });
  }
});

router.post("/inventory/counts/:id/submit", async (req, res) => {
  const id = Number(req.params.id);
  const current = await query<{ status: string }>(`SELECT status FROM inventory_counts WHERE id = $1`, [id]);
  if (!current.rows[0]) {
    res.status(404).json({ error: "Inventário não encontrado" });
    return;
  }
  if (!["draft", "rejected"].includes(current.rows[0].status)) {
    res.status(400).json({ error: "Inventário não está em rascunho" });
    return;
  }
  const missing = await query(
    `SELECT 1 FROM inventory_count_lines WHERE count_id = $1 AND counted_qty IS NULL LIMIT 1`,
    [id],
  );
  if (missing.rows[0]) {
    res.status(400).json({ error: "Preencha todas as quantidades contadas" });
    return;
  }
  await query(
    `UPDATE inventory_counts SET status = 'pending', submitted_at = NOW() WHERE id = $1`,
    [id],
  );
  res.json(await loadCount(id));
});

router.post("/inventory/counts/:id/approve", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password, note } = req.body as { password?: string; note?: string };
    if (!password) {
      res.status(400).json({ error: "Senha obrigatória para aprovar" });
      return;
    }
    const user = await query<{ password_hash: string; name: string; email: string }>(
      `SELECT password_hash, name, email FROM users WHERE id = $1`,
      [req.user!.id],
    );
    if (!user.rows[0] || !(await bcrypt.compare(password, user.rows[0].password_hash))) {
      res.status(403).json({ error: "Senha incorreta" });
      return;
    }
    const current = await query<{ status: string }>(`SELECT status FROM inventory_counts WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Inventário não encontrado" });
      return;
    }
    if (current.rows[0].status !== "pending") {
      res.status(400).json({ error: "Só inventários pendentes podem ser aprovados" });
      return;
    }

    await query("BEGIN");
    try {
      const lines = await query<{ product_id: number; system_qty: number; counted_qty: number }>(
        `SELECT product_id, system_qty, counted_qty FROM inventory_count_lines WHERE count_id = $1`,
        [id],
      );
      for (const line of lines.rows) {
        const delta = Number(line.counted_qty) - Number(line.system_qty);
        if (delta === 0) continue;
        await adjustStock({
          productId: line.product_id,
          delta,
          reason: "inventory",
          userId: req.user!.id,
          note: `Inventário #${id}`,
          inventoryCountId: id,
        });
      }
      await query(
        `UPDATE inventory_counts SET
           status = 'approved', approved_by = $2, approved_at = NOW(), approval_note = $3
         WHERE id = $1`,
        [id, req.user!.id, note ?? null],
      );
      await query(
        `INSERT INTO inventory_approvals (count_id, action, actor_id, actor_name, actor_email, note)
         VALUES ($1, 'approved', $2, $3, $4, $5)`,
        [id, req.user!.id, user.rows[0].name, user.rows[0].email, note ?? null],
      );
      await query("COMMIT");
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
    res.json(await loadCount(id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro na aprovação" });
  }
});

router.post("/inventory/counts/:id/reject", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password, note } = req.body as { password?: string; note?: string };
    if (!password) {
      res.status(400).json({ error: "Senha obrigatória para rejeitar" });
      return;
    }
    const user = await query<{ password_hash: string; name: string; email: string }>(
      `SELECT password_hash, name, email FROM users WHERE id = $1`,
      [req.user!.id],
    );
    if (!user.rows[0] || !(await bcrypt.compare(password, user.rows[0].password_hash))) {
      res.status(403).json({ error: "Senha incorreta" });
      return;
    }
    const current = await query<{ status: string }>(`SELECT status FROM inventory_counts WHERE id = $1`, [id]);
    if (!current.rows[0] || current.rows[0].status !== "pending") {
      res.status(400).json({ error: "Só inventários pendentes podem ser rejeitados" });
      return;
    }
    await query(
      `UPDATE inventory_counts SET status = 'rejected', approval_note = $2 WHERE id = $1`,
      [id, note ?? null],
    );
    await query(
      `INSERT INTO inventory_approvals (count_id, action, actor_id, actor_name, actor_email, note)
       VALUES ($1, 'rejected', $2, $3, $4, $5)`,
      [id, req.user!.id, user.rows[0].name, user.rows[0].email, note ?? null],
    );
    res.json(await loadCount(id));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro na rejeição" });
  }
});

/** —— Pedido de venda —— */
router.get("/orders/next-number", async (_req, res) => {
  const orderNumber = await peekOrderNumber();
  res.json({ orderNumber, date: new Date().toISOString() });
});

router.get("/pricing/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const qty = Math.max(1, Number(req.query.qty ?? 1));
    const product = await query<{
      id: number;
      price_cents: number;
      promo_price_cents: number | null;
      stock_qty: number | null;
      access_days: number;
      name: string;
      type: string;
      code: string;
    }>(
      `SELECT id, code, price_cents, promo_price_cents, stock_qty, access_days, name, type
       FROM product_catalog WHERE id = $1`,
      [productId],
    );
    if (!product.rows[0]) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    const quote = await quoteProduct(product.rows[0], qty);
    res.json({ ...quote, code: product.rows[0].code, name: product.rows[0].name, stock_qty: product.rows[0].stock_qty });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro no preço" });
  }
});

router.get("/shop-customers", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const document = onlyDigits(typeof req.query.document === "string" ? req.query.document : "");
  const includeInactive = req.query.all === "1";
  if (document) {
    const r = await query(
      `SELECT * FROM customers WHERE document = $1 LIMIT 1`,
      [document],
    );
    res.json(r.rows[0] ? [r.rows[0]] : []);
    return;
  }
  const activeFilter = includeInactive ? "" : "AND active = true";
  if (!q) {
    const r = await query(
      `SELECT * FROM customers WHERE 1=1 ${activeFilter} ORDER BY active DESC, name LIMIT 100`,
    );
    res.json(r.rows);
    return;
  }
  const r = await query(
    `SELECT * FROM customers
     WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR document ILIKE $2)
       ${includeInactive ? "" : "AND active = true"}
     ORDER BY active DESC, name LIMIT 50`,
    [`%${q}%`, `%${onlyDigits(q) || q}%`],
  );
  res.json(r.rows);
});

router.post("/shop-customers", async (req, res) => {
  try {
    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      document?: string;
      notes?: string;
      active?: boolean;
    };
    if (!body.name?.trim()) {
      res.status(400).json({ error: "Nome obrigatório" });
      return;
    }
    const document = onlyDigits(body.document) || null;
    if (document) {
      const exists = await query(`SELECT id FROM customers WHERE document = $1`, [document]);
      if (exists.rows[0]) {
        const updated = await query(
          `UPDATE customers SET
             name = $2, email = COALESCE($3, email), phone = COALESCE($4, phone),
             notes = COALESCE($5, notes), active = COALESCE($6, active), updated_at = NOW()
           WHERE id = $1 RETURNING *`,
          [
            exists.rows[0].id,
            body.name.trim(),
            body.email ?? null,
            body.phone ?? null,
            body.notes ?? null,
            body.active ?? true,
          ],
        );
        res.json(updated.rows[0]);
        return;
      }
    }
    const inserted = await query(
      `INSERT INTO customers (name, email, phone, document, notes, active)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,true)) RETURNING *`,
      [
        body.name.trim(),
        body.email ?? null,
        body.phone ?? null,
        document,
        body.notes ?? null,
        body.active ?? true,
      ],
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao salvar cliente" });
  }
});

router.patch("/shop-customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const current = await query(`SELECT * FROM customers WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Cliente não encontrado" });
      return;
    }
    const c = current.rows[0];
    const document =
      body.document !== undefined ? onlyDigits(String(body.document)) || null : c.document;
    const updated = await query(
      `UPDATE customers SET
         name = $2, email = $3, phone = $4, document = $5, notes = $6, active = $7, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id,
        body.name != null ? String(body.name).trim() : c.name,
        body.email !== undefined ? body.email || null : c.email,
        body.phone !== undefined ? body.phone || null : c.phone,
        document,
        body.notes !== undefined ? body.notes || null : c.notes,
        body.active != null ? Boolean(body.active) : c.active,
      ],
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar cliente" });
  }
});

router.post("/documents/lookup", async (req, res) => {
  try {
    const body = req.body as { document?: string; type?: "cpf" | "cnpj" };
    const document = String(body.document ?? "");
    const preferredType = body.type === "cpf" || body.type === "cnpj" ? body.type : undefined;
    const digitsDoc = onlyDigits(document);
    if (!digitsDoc) {
      res.status(400).json({ error: "Informe CPF ou CNPJ" });
      return;
    }

    const expectedLen = preferredType === "cnpj" ? 14 : preferredType === "cpf" ? 11 : null;
    const lookupDigits =
      expectedLen != null ? digitsDoc.slice(0, expectedLen) : digitsDoc;

    const local = await query(`SELECT * FROM customers WHERE document = $1 LIMIT 1`, [lookupDigits]);
    if (local.rows[0]) {
      const c = local.rows[0];
      res.json({
        document: lookupDigits,
        type: preferredType ?? (lookupDigits.length === 14 ? "cnpj" : "cpf"),
        valid: true,
        source: "local",
        name: c.name,
        email: c.email,
        phone: c.phone,
        customerId: c.id,
        active: c.active,
        message: "Cliente encontrado no cadastro local.",
      });
      return;
    }

    const publicData = await lookupPublicDocument(digitsDoc, preferredType);
    res.json(publicData);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Falha na consulta" });
  }
});

/** Cupons */
router.get("/coupons", async (_req, res) => {
  const r = await query(`SELECT * FROM coupons ORDER BY active DESC, code`);
  res.json(r.rows);
});

router.post("/coupons", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!code) {
      res.status(400).json({ error: "Código obrigatório" });
      return;
    }
    const inserted = await query(
      `INSERT INTO coupons (
         code, description, discount_type, discount_value, max_uses,
         valid_from, valid_until, active, min_order_cents
       ) VALUES ($1,$2,$3,$4,$5,COALESCE($6::date, CURRENT_DATE),$7,COALESCE($8,true),COALESCE($9,0))
       RETURNING *`,
      [
        code,
        body.description ?? null,
        body.discount_type === "fixed" ? "fixed" : "percent",
        Number(body.discount_value),
        body.max_uses === "" || body.max_uses == null ? null : Number(body.max_uses),
        body.valid_from ?? null,
        body.valid_until || null,
        body.active !== false,
        Number(body.min_order_cents ?? 0),
      ],
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao criar cupom" });
  }
});

router.patch("/coupons/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const current = await query(`SELECT * FROM coupons WHERE id = $1`, [id]);
    if (!current.rows[0]) {
      res.status(404).json({ error: "Cupom não encontrado" });
      return;
    }
    const c = current.rows[0];
    const updated = await query(
      `UPDATE coupons SET
         code = $2, description = $3, discount_type = $4, discount_value = $5,
         max_uses = $6, valid_from = $7, valid_until = $8, active = $9,
         min_order_cents = $10, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id,
        String(body.code ?? c.code).trim().toUpperCase(),
        body.description !== undefined ? body.description : c.description,
        body.discount_type === "fixed" || body.discount_type === "percent"
          ? body.discount_type
          : c.discount_type,
        body.discount_value != null ? Number(body.discount_value) : c.discount_value,
        body.max_uses === undefined
          ? c.max_uses
          : body.max_uses === "" || body.max_uses == null
            ? null
            : Number(body.max_uses),
        body.valid_from ?? c.valid_from,
        body.valid_until === undefined ? c.valid_until : body.valid_until || null,
        body.active != null ? Boolean(body.active) : c.active,
        body.min_order_cents != null ? Number(body.min_order_cents) : c.min_order_cents,
      ],
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar cupom" });
  }
});

router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, subtotalCents } = req.body as { code?: string; subtotalCents?: number };
    if (!code) {
      res.status(400).json({ error: "Informe o cupom" });
      return;
    }
    const coupon = await findCouponByCode(code);
    if (!coupon) {
      res.status(404).json({ error: "Cupom não encontrado" });
      return;
    }
    const result = validateCoupon(coupon, Number(subtotalCents ?? 0));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({
      code: coupon.code,
      discountCents: result.discountCents,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      remainingUses: result.remainingUses,
      description: coupon.description,
    });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Cupom inválido" });
  }
});

router.post("/orders/sale", async (req, res) => {
  try {
    const body = req.body as {
      customerId?: number;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerDocument?: string;
      saveCustomer?: boolean;
      channel?: string;
      paymentMethod?: string;
      paymentStatus?: string;
      markPaid?: boolean;
      discountCents?: number;
      shippingCents?: number;
      shippingAddress?: string;
      notes?: string;
      couponCode?: string;
      items?: Array<{ productId: number; quantity: number; unitPriceCents?: number }>;
    };
    if (!Array.isArray(body.items) || body.items.length === 0) {
      res.status(400).json({ error: "Inclua ao menos um item" });
      return;
    }

    const markPaid = body.markPaid === true || body.paymentStatus === "paid";
    const paymentMethod = body.paymentMethod ?? "manual";
    const channel = body.channel ?? "admin";
    const manualDiscount = Math.max(0, Number(body.discountCents ?? 0));
    const shipping = Math.max(0, Number(body.shippingCents ?? 0));
    const document = onlyDigits(body.customerDocument) || null;

    let customerId = body.customerId ?? null;
    if (body.saveCustomer && body.customerName?.trim()) {
      if (document) {
        const existing = await query<{ id: number }>(`SELECT id FROM customers WHERE document = $1`, [document]);
        if (existing.rows[0]) {
          customerId = existing.rows[0].id;
          await query(
            `UPDATE customers SET name = $2, email = COALESCE($3, email), phone = COALESCE($4, phone), updated_at = NOW()
             WHERE id = $1`,
            [customerId, body.customerName.trim(), body.customerEmail ?? null, body.customerPhone ?? null],
          );
        }
      }
      if (!customerId) {
        const created = await query<{ id: number }>(
          `INSERT INTO customers (name, email, phone, document) VALUES ($1,$2,$3,$4) RETURNING id`,
          [body.customerName.trim(), body.customerEmail ?? null, body.customerPhone ?? null, document],
        );
        customerId = created.rows[0].id;
      }
    }

    type Line = {
      product: {
        id: number;
        price_cents: number;
        promo_price_cents: number | null;
        stock_qty: number | null;
        access_days: number;
        name: string;
        type: string;
      };
      qty: number;
      unit: number;
    };
    const lines: Line[] = [];
    for (const item of body.items) {
      const qty = Math.max(1, Number(item.quantity ?? 1));
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
        [item.productId],
      );
      if (!product.rows[0]) throw new Error(`Produto #${item.productId} não encontrado`);
      const p = product.rows[0];
      const unit =
        item.unitPriceCents != null ? Number(item.unitPriceCents) : await resolveUnitPrice(p, qty);
      lines.push({ product: p, qty, unit });
    }

    const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);

    let couponId: number | null = null;
    let couponCode: string | null = null;
    let couponDiscount = 0;
    if (body.couponCode?.trim()) {
      const coupon = await findCouponByCode(body.couponCode);
      if (!coupon) throw new Error("Cupom não encontrado");
      const validated = validateCoupon(coupon, subtotal);
      if (!validated.ok) throw new Error(validated.error);
      couponId = coupon.id;
      couponCode = coupon.code;
      couponDiscount = validated.discountCents;
    }

    const discount = manualDiscount + couponDiscount;
    const total = Math.max(0, subtotal - discount + shipping);
    const orderNumber = await nextOrderNumber();
    const status = markPaid ? "paid" : "pending";
    const paymentStatus = markPaid
      ? "paid"
      : paymentMethod === "pix" || paymentMethod === "credit" || paymentMethod === "debit"
        ? "awaiting_payment"
        : "pending";
    const paymentProvider = "manual";

    await query("BEGIN");
    try {
      if (couponId) {
        const locked = await query<{ used_count: number; max_uses: number | null; active: boolean }>(
          `SELECT used_count, max_uses, active FROM coupons WHERE id = $1 FOR UPDATE`,
          [couponId],
        );
        const c = locked.rows[0];
        if (!c?.active || (c.max_uses != null && c.used_count >= c.max_uses)) {
          throw new Error("Cupom esgotado ou inativo");
        }
      }

      const order = await query<{ id: number }>(
        `INSERT INTO orders (
           order_number, user_id, customer_id, guest_name, guest_email, customer_phone, customer_document,
           status, payment_status, payment_method, payment_provider,
           total_cents, discount_cents, shipping_cents, channel, notes, shipping_address,
           coupon_id, coupon_code, coupon_discount_cents,
           created_by, paid_at
         ) VALUES (
           $1, NULL, $2, $3, $4, $5, $6,
           $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16,
           $17, $18, $19,
           $20, $21
         ) RETURNING id`,
        [
          orderNumber,
          customerId,
          body.customerName ?? null,
          body.customerEmail ?? null,
          body.customerPhone ?? null,
          document,
          status,
          paymentStatus,
          paymentMethod,
          paymentProvider,
          total,
          discount,
          shipping,
          channel,
          body.notes ?? null,
          body.shippingAddress ?? null,
          couponId,
          couponCode,
          couponDiscount,
          req.user!.id,
          markPaid ? new Date() : null,
        ],
      );
      const orderId = order.rows[0].id;
      for (const line of lines) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1,$2,$3,$4)`,
          [orderId, line.product.id, line.qty, line.unit],
        );
        if (markPaid) {
          await debitStock({
            productId: line.product.id,
            quantity: line.qty,
            reason: channel === "web" ? "sale" : "offsite",
            orderId,
            userId: req.user!.id,
            note: body.notes,
          });
        }
      }
      if (couponId) {
        await query(
          `UPDATE coupons SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1`,
          [couponId],
        );
        await query(
          `INSERT INTO coupon_redemptions (coupon_id, order_id, discount_cents) VALUES ($1,$2,$3)`,
          [couponId, orderId, couponDiscount],
        );
      }
      await query("COMMIT");
      res.status(201).json({
        id: orderId,
        orderNumber,
        totalCents: total,
        subtotalCents: subtotal,
        discountCents: discount,
        couponDiscountCents: couponDiscount,
        status,
        paymentStatus,
        paymentMethod,
        paymentProvider,
        customerId,
        gatewayReady: ["credit", "debit", "pix"].includes(paymentMethod),
        message:
          paymentMethod === "credit" || paymentMethod === "debit" || paymentMethod === "pix"
            ? "Pedido criado. Gateway de pagamento será conectado em breve (cartão e Pix)."
            : "Pedido de venda registrado",
      });
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro no pedido" });
  }
});

router.post("/orders/:id/mark-paid", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await query<{
      id: number;
      status: string;
      payment_status: string;
      channel: string;
    }>(`SELECT id, status, payment_status, channel FROM orders WHERE id = $1`, [id]);
    if (!order.rows[0]) {
      res.status(404).json({ error: "Pedido não encontrado" });
      return;
    }
    if (order.rows[0].payment_status === "paid") {
      res.json({ ok: true, alreadyPaid: true });
      return;
    }
    const items = await query<{ product_id: number; quantity: number }>(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [id],
    );
    await query("BEGIN");
    try {
      for (const item of items.rows) {
        await debitStock({
          productId: item.product_id,
          quantity: item.quantity,
          reason: order.rows[0].channel === "web" ? "sale" : "offsite",
          orderId: id,
          userId: req.user!.id,
        });
      }
      await query(
        `UPDATE orders SET
           status = 'paid', payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [id],
      );
      await query("COMMIT");
    } catch (err) {
      await query("ROLLBACK");
      throw err;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao baixar pedido" });
  }
});

/** —— Banners publicitários —— */
const BANNER_SELECT = `
  b.id, b.title, b.description, b.image_url, b.link_url, b.customer_id,
  b.cost_per_impression_cents, b.impression_count, b.valid_from, b.valid_until,
  b.active, b.sort_order, b.created_at, b.updated_at,
  c.name AS customer_name, c.document AS customer_document,
  (b.impression_count * b.cost_per_impression_cents) AS total_cost_cents
`;

router.get("/banners", async (_req, res) => {
  const r = await query(
    `SELECT ${BANNER_SELECT}
     FROM ad_banners b
     LEFT JOIN customers c ON c.id = b.customer_id
     ORDER BY b.active DESC, b.sort_order, b.id DESC`,
  );
  res.json(r.rows);
});

router.get("/banners/summary", async (_req, res) => {
  const overall = await query<{
    impressions: string;
    total_cents: string;
    banners: string;
  }>(
    `SELECT
       COALESCE(SUM(impression_count), 0)::text AS impressions,
       COALESCE(SUM(impression_count * cost_per_impression_cents), 0)::text AS total_cents,
       COUNT(*)::text AS banners
     FROM ad_banners`,
  );
  const byCustomer = await query(
    `SELECT
       c.id AS customer_id,
       c.name AS customer_name,
       c.document AS customer_document,
       COALESCE(SUM(b.impression_count), 0)::int AS impressions,
       COALESCE(SUM(b.impression_count * b.cost_per_impression_cents), 0)::int AS total_cents,
       COUNT(b.id)::int AS banners
     FROM customers c
     JOIN ad_banners b ON b.customer_id = c.id
     GROUP BY c.id, c.name, c.document
     ORDER BY total_cents DESC, c.name`,
  );
  res.json({
    overall: {
      impressions: Number(overall.rows[0]?.impressions ?? 0),
      totalCents: Number(overall.rows[0]?.total_cents ?? 0),
      banners: Number(overall.rows[0]?.banners ?? 0),
    },
    byCustomer: byCustomer.rows.map((row) => ({
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerDocument: row.customer_document,
      impressions: row.impressions,
      totalCents: row.total_cents,
      banners: row.banners,
    })),
  });
});

router.get("/banners/:id/impressions", async (req, res) => {
  const id = Number(req.params.id);
  const r = await query(
    `SELECT i.id, i.banner_id, i.customer_id, i.cost_cents, i.created_at,
            c.name AS customer_name
     FROM ad_banner_impressions i
     LEFT JOIN customers c ON c.id = i.customer_id
     WHERE i.banner_id = $1
     ORDER BY i.created_at DESC
     LIMIT 500`,
    [id],
  );
  res.json(r.rows);
});

router.get("/banners/:id/impressions.pdf", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const banner = await query<{
      id: number;
      title: string;
      description: string | null;
      customer_name: string | null;
      customer_document: string | null;
      cost_per_impression_cents: number;
      impression_count: number;
      total_cost_cents: string | number;
      valid_from: string;
      valid_until: string | null;
    }>(
      `SELECT b.id, b.title, b.description, b.cost_per_impression_cents, b.impression_count,
              b.valid_from, b.valid_until,
              (b.impression_count * b.cost_per_impression_cents) AS total_cost_cents,
              c.name AS customer_name, c.document AS customer_document
       FROM ad_banners b
       LEFT JOIN customers c ON c.id = b.customer_id
       WHERE b.id = $1`,
      [id],
    );
    if (!banner.rows[0]) {
      res.status(404).json({ error: "Banner não encontrado" });
      return;
    }
    const rows = await query(
      `SELECT i.id, i.banner_id, i.customer_id, i.cost_cents, i.created_at,
              c.name AS customer_name
       FROM ad_banner_impressions i
       LEFT JOIN customers c ON c.id = i.customer_id
       WHERE i.banner_id = $1
       ORDER BY i.created_at DESC
       LIMIT 2000`,
      [id],
    );
    const b = banner.rows[0];
    sendBannerExtractPdf(
      res,
      {
        bannerId: b.id,
        title: b.title,
        description: b.description,
        customerName: b.customer_name,
        customerDocument: b.customer_document,
        costPerImpressionCents: b.cost_per_impression_cents,
        impressionCount: b.impression_count,
        totalCents: Number(b.total_cost_cents ?? 0),
        validFrom: b.valid_from,
        validUntil: b.valid_until,
      },
      rows.rows,
    );
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Erro ao gerar PDF" });
    }
  }
});

router.post("/banners", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    if (!title) {
      res.status(400).json({ error: "Título é obrigatório" });
      return;
    }
    const imageUrl = String(body.image_url ?? "").trim() || "/uploads/banners/pending.svg";
    const customerId =
      body.customer_id === "" || body.customer_id == null ? null : Number(body.customer_id);
    if (customerId != null) {
      const c = await query(`SELECT id FROM customers WHERE id = $1 AND active = true`, [customerId]);
      if (!c.rows[0]) {
        res.status(400).json({ error: "Cliente pagante deve estar cadastrado e ativo" });
        return;
      }
    }
    const inserted = await query(
      `INSERT INTO ad_banners (
         title, description, image_url, link_url, customer_id,
         cost_per_impression_cents, valid_from, valid_until, active, sort_order
       ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::date, CURRENT_DATE),$8,COALESCE($9,true),COALESCE($10,0))
       RETURNING id`,
      [
        title,
        body.description ?? null,
        imageUrl,
        body.link_url || null,
        customerId,
        Math.max(0, Number(body.cost_per_impression_cents ?? 0)),
        body.valid_from ?? null,
        body.valid_until || null,
        body.active !== false,
        Number(body.sort_order ?? 0),
      ],
    );
    const full = await query(
      `SELECT ${BANNER_SELECT} FROM ad_banners b LEFT JOIN customers c ON c.id = b.customer_id WHERE b.id = $1`,
      [inserted.rows[0].id],
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao criar banner" });
  }
});

router.patch("/banners/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const cur = await query(`SELECT * FROM ad_banners WHERE id = $1`, [id]);
    if (!cur.rows[0]) {
      res.status(404).json({ error: "Banner não encontrado" });
      return;
    }
    const customerId =
      body.customer_id === undefined
        ? cur.rows[0].customer_id
        : body.customer_id === "" || body.customer_id == null
          ? null
          : Number(body.customer_id);
    if (customerId != null) {
      const c = await query(`SELECT id FROM customers WHERE id = $1 AND active = true`, [customerId]);
      if (!c.rows[0]) {
        res.status(400).json({ error: "Cliente pagante deve estar cadastrado e ativo" });
        return;
      }
    }
    await query(
      `UPDATE ad_banners SET
         title = $2,
         description = $3,
         image_url = $4,
         link_url = $5,
         customer_id = $6,
         cost_per_impression_cents = $7,
         valid_from = $8::date,
         valid_until = $9::date,
         active = $10,
         sort_order = $11,
         updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        body.title ?? cur.rows[0].title,
        body.description !== undefined ? body.description : cur.rows[0].description,
        body.image_url ?? cur.rows[0].image_url,
        body.link_url !== undefined ? body.link_url || null : cur.rows[0].link_url,
        customerId,
        body.cost_per_impression_cents != null
          ? Math.max(0, Number(body.cost_per_impression_cents))
          : cur.rows[0].cost_per_impression_cents,
        body.valid_from ?? cur.rows[0].valid_from,
        body.valid_until !== undefined ? body.valid_until || null : cur.rows[0].valid_until,
        body.active !== undefined ? body.active !== false : cur.rows[0].active,
        body.sort_order != null ? Number(body.sort_order) : cur.rows[0].sort_order,
      ],
    );
    const full = await query(
      `SELECT ${BANNER_SELECT} FROM ad_banners b LEFT JOIN customers c ON c.id = b.customer_id WHERE b.id = $1`,
      [id],
    );
    res.json(full.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao atualizar banner" });
  }
});

router.delete("/banners/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query(`DELETE FROM ad_banners WHERE id = $1`, [id]);
  res.json({ ok: true });
});

export default router;
