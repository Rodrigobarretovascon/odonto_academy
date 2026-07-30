import { Router } from "express";
import { query } from "../db/pool.js";
import { getPaymentProviderStatus } from "../services/payments.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json(getPaymentProviderStatus());
});

/**
 * Webhook Mercado Pago — marca pedido pago e cria assinatura se ainda não existir.
 * Em modo demo este endpoint não é usado pelo checkout web.
 */
router.post("/webhook", async (req, res) => {
  const cfg = getPaymentProviderStatus();
  if (cfg.status !== "ready") {
    res.status(503).json({ error: "Pagamentos não configurados" });
    return;
  }

  // Validação completa do payload MP fica para a ativação com token real.
  const body = req.body as {
    type?: string;
    data?: { id?: string };
    external_reference?: string;
  };

  const orderId = Number(body.external_reference);
  if (!orderId) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  await query(
    `UPDATE orders
     SET status = 'paid',
         payment_status = 'approved',
         payment_provider = 'mercadopago',
         paid_at = COALESCE(paid_at, NOW())
     WHERE id = $1 AND payment_status IS DISTINCT FROM 'approved'`,
    [orderId],
  );

  // Garante assinaturas a partir dos itens com access_days
  await query(
    `INSERT INTO subscriptions (user_id, product_id, order_id, expires_at)
     SELECT o.user_id, oi.product_id, o.id, NOW() + (p.access_days || ' days')::interval
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.id = $1 AND p.access_days > 0
       AND NOT EXISTS (
         SELECT 1 FROM subscriptions s WHERE s.order_id = o.id AND s.product_id = p.id
       )`,
    [orderId],
  );

  res.json({ ok: true });
});

export default router;
