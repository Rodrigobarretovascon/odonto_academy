import { Router } from "express";
import { query } from "../db/pool.js";
import { adminRequired } from "../middleware/auth.js";

const router = Router();

router.use(adminRequired);

router.get("/dashboard", async (_req, res) => {
  const [revenue, orders, subs, recent] = await Promise.all([
    query<{ total: string }>(
      `SELECT COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE status = 'paid'`,
    ),
    query<{ count: string }>(`SELECT COUNT(*) AS count FROM orders WHERE status = 'paid'`),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT user_id) AS count FROM subscriptions WHERE active = true AND expires_at > NOW()`,
    ),
    query(
      `SELECT o.id, o.total_cents, o.created_at, u.name AS customer, u.email,
              string_agg(p.name, ', ') AS products
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status = 'paid'
       GROUP BY o.id, u.name, u.email
       ORDER BY o.created_at DESC LIMIT 20`,
    ),
  ]);

  const monthly = await query<{ month: string; total: string }>(
    `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
            SUM(total_cents) AS total
     FROM orders WHERE status = 'paid'
     GROUP BY 1 ORDER BY 1 DESC LIMIT 6`,
  );

  res.json({
    revenueCents: Number(revenue.rows[0].total),
    ordersCount: Number(orders.rows[0].count),
    activeSubscribers: Number(subs.rows[0].count),
    recentOrders: recent.rows,
    monthlyRevenue: monthly.rows,
  });
});

router.get("/subscriptions", async (_req, res) => {
  const result = await query(
    `SELECT s.id, u.name, u.email, p.name AS product, s.starts_at, s.expires_at, s.active
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     JOIN products p ON p.id = s.product_id
     ORDER BY s.expires_at DESC LIMIT 50`,
  );
  res.json(result.rows);
});

export default router;
