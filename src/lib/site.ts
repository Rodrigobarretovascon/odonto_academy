/** Contatos e links públicos — ajuste quando os canais oficiais mudarem. */

const DEFAULT_WHATSAPP_PHONE = "5585999999999"; // troque pelo número oficial (DDI+DDD+número)
const DEFAULT_WHATSAPP_DISPLAY = "(85) 99999-9999";

const whatsappPhone =
  (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined)?.replace(/\D/g, "") ||
  DEFAULT_WHATSAPP_PHONE;

const whatsappDisplay =
  (import.meta.env.VITE_WHATSAPP_DISPLAY as string | undefined) || DEFAULT_WHATSAPP_DISPLAY;

const whatsappPrefill =
  (import.meta.env.VITE_WHATSAPP_PREFILL as string | undefined) ||
  "Olá! Estou acessando a plataforma GB Dental e gostaria de tirar uma dúvida.";

export const SITE = {
  brand: "GB Dental by Gabriela Barreto",
  brandShort: "GB Dental",
  founder: "Gabriela Barreto",
  whatsappPhone,
  whatsappDisplay,
  whatsappPrefill,
  whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappPrefill)}`,
  instagramUrl: "https://instagram.com/gbdental",
  supportEmail: "contato@gbdental.com.br",
} as const;

/** Destino padrão do conteúdo exclusivo quando o visitante não tem acesso. */
export function subscriberAccessPath(from: string) {
  return {
    pathname: "/acesso" as const,
    state: { from },
  };
}
