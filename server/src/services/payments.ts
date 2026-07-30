/**
 * Integração de pagamento (Mercado Pago).
 * Nunca armazene PAN/CVV — apenas IDs e status do provedor.
 *
 * Variáveis necessárias:
 * - MERCADOPAGO_ACCESS_TOKEN
 * - MERCADOPAGO_PUBLIC_KEY
 * - PAYMENT_WEBHOOK_SECRET (opcional, validação de webhook)
 * - PUBLIC_APP_URL (ex.: https://gbdental.com.br)
 */

export type PaymentProviderStatus = "not_configured" | "ready";

export function getPaymentProviderStatus(): {
  status: PaymentProviderStatus;
  provider: "mercadopago" | "demo";
  missing: string[];
} {
  const missing: string[] = [];
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) missing.push("MERCADOPAGO_ACCESS_TOKEN");
  if (!process.env.MERCADOPAGO_PUBLIC_KEY) missing.push("MERCADOPAGO_PUBLIC_KEY");
  if (missing.length) {
    return { status: "not_configured", provider: "demo", missing };
  }
  return { status: "ready", provider: "mercadopago", missing: [] };
}

/** Cria preferência/checkout no Mercado Pago quando configurado. */
export async function createCheckoutPreference(input: {
  orderId: number;
  totalCents: number;
  title: string;
  payerEmail: string;
}): Promise<{ mode: "demo" | "mercadopago"; checkoutUrl?: string; preferenceId?: string }> {
  const cfg = getPaymentProviderStatus();
  if (cfg.status !== "ready") {
    return { mode: "demo" };
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
  const appUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";
  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_reference: String(input.orderId),
      items: [
        {
          title: input.title,
          quantity: 1,
          unit_price: input.totalCents / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: input.payerEmail },
      back_urls: {
        success: `${appUrl}/checkout?status=approved`,
        failure: `${appUrl}/checkout?status=rejected`,
        pending: `${appUrl}/checkout?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/payments/webhook`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago preference failed: ${text}`);
  }
  const data = (await res.json()) as { id: string; init_point?: string; sandbox_init_point?: string };
  return {
    mode: "mercadopago",
    preferenceId: data.id,
    checkoutUrl: data.init_point ?? data.sandbox_init_point,
  };
}
