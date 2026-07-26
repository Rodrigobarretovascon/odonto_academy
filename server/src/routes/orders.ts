import { Router } from "express";
import { query } from "../db/pool.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

interface CartItem {
  productId: number;
  quantity: number;
}

router.post("/checkout", authRequired, async (req, res) => {
  const { items, paymentMethod = "demo" } = req.body as {
    items?: CartItem[];
    paymentMethod?: string;
  };
  if (!items?.length) {
    res.status(400).json({ error: "Carrinho vazio" });
    return;
  }

  const ids = items.map((i) => i.productId);
  const products = await query<{
    id: number;
    price_cents: number;
    access_days: number;
    name: string;
  }>(`SELECT id, price_cents, access_days, name FROM products WHERE id = ANY($1) AND active = true`, [ids]);

  if (products.rows.length !== ids.length) {
    res.status(400).json({ error: "Produto inválido no carrinho" });
    return;
  }

  const productMap = new Map(products.rows.map((p) => [p.id, p]));
  let total = 0;
  const lineItems: { productId: number; quantity: number; unitPrice: number; accessDays: number }[] = [];

  for (const item of items) {
    const p = productMap.get(item.productId)!;
    const qty = Math.max(1, item.quantity);
    total += p.price_cents * qty;
    lineItems.push({
      productId: p.id,
      quantity: qty,
      unitPrice: p.price_cents,
      accessDays: p.access_days,
    });
  }

  const order = await query<{ id: number }>(
    `INSERT INTO orders (user_id, status, total_cents, payment_method)
     VALUES ($1, 'paid', $2, $3) RETURNING id`,
    [req.user!.id, total, paymentMethod],
  );
  const orderId = order.rows[0].id;

  for (const li of lineItems) {
    await query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1,$2,$3,$4)`,
      [orderId, li.productId, li.quantity, li.unitPrice],
    );
    if (li.accessDays > 0) {
      await query(
        `INSERT INTO subscriptions (user_id, product_id, order_id, expires_at)
         VALUES ($1, $2, $3, NOW() + ($4 || ' days')::INTERVAL)`,
        [req.user!.id, li.productId, orderId, String(li.accessDays)],
      );
    }
  }

  res.status(201).json({ orderId, total, message: "Compra realizada com sucesso!" });
});

router.get("/mine", authRequired, async (req, res) => {
  const result = await query(
    `SELECT o.id, o.status, o.total_cents, o.created_at,
            json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'unit_price_cents', oi.unit_price_cents)) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1
     GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user!.id],
  );
  res.json(result.rows);
});

export default router;
