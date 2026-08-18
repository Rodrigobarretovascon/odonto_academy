/** Logos oficiais — Gabriela Barreto Dental (claro / escuro) */
const LOGO_WORDMARK = "/images/brand/gbd-logo-wordmark.png?v=3";
const LOGO_FULL_LIGHT = LOGO_WORDMARK;
const LOGO_FULL_DARK = "/images/brand/gbd-logo-full-dark.png?v=3";
const LOGO_MARK_LIGHT = "/images/brand/gbd-logo-mark-light.png?v=3";
const LOGO_MARK_DARK = "/images/brand/gbd-logo-mark-dark.png?v=3";

/** Compat: defaults = versão clara (fundo bege) */
const LOGO_FULL = LOGO_FULL_LIGHT;
const LOGO_MARK = LOGO_MARK_LIGHT;

/** Marca compacta (GB no dente) — só para espaços pequenos. */
export function BrandMark({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const height = size;
  const width = Math.round(size * 0.95);
  return (
    <span className={`gb-mark-wrap ${className}`} style={{ width, height, display: "inline-flex" }}>
      <img
        className="gb-mark gb-mark--light"
        src={LOGO_MARK_LIGHT}
        alt=""
        width={width}
        height={height}
        decoding="async"
        style={{ width, height, objectFit: "contain" }}
      />
      <img
        className="gb-mark gb-mark--dark"
        src={LOGO_MARK_DARK}
        alt=""
        width={width}
        height={height}
        decoding="async"
        style={{ width, height, objectFit: "contain" }}
      />
    </span>
  );
}

function HeartRule({ className = "" }: { className?: string }) {
  return (
    <span className={`gb-heart-rule ${className}`} aria-hidden>
      <span className="gb-heart-rule__line" />
      <span className="gb-heart-rule__dot" />
      <span className="gb-heart-rule__line" />
    </span>
  );
}

/**
 * Logo principal: monograma GB no dente + GABRIELA BARRETO + DENTAL.
 * Troca automaticamente entre versões clara e escura via `data-theme`.
 */
export function BrandLockup({
  size = "md",
}: {
  variant?: "horizontal" | "stacked";
  showRule?: boolean;
  size?: "sm" | "md" | "lg";
  mode?: "image" | "type";
}) {
  const compact = size === "sm";
  const heights = { sm: 44, md: 64, lg: 112 } as const;
  const h = heights[size];

  return (
    <span
      className={`gb-lockup gb-lockup--image gb-lockup--${size}${
        compact ? " gb-lockup--mark" : " gb-lockup--full"
      }`}
    >
      <img
        src={compact ? LOGO_MARK_LIGHT : LOGO_FULL_LIGHT}
        alt="Gabriela Barreto Dental"
        className="gb-lockup__img gb-lockup__img--light"
        height={h}
        decoding="async"
      />
      <img
        src={compact ? LOGO_MARK_DARK : LOGO_FULL_DARK}
        alt=""
        aria-hidden
        className="gb-lockup__img gb-lockup__img--dark"
        height={h}
        decoding="async"
      />
    </span>
  );
}

export {
  HeartRule,
  LOGO_MARK as AI_MASCOT_SRC,
  LOGO_FULL,
  LOGO_MARK,
  LOGO_FULL_LIGHT,
  LOGO_FULL_DARK,
  LOGO_MARK_LIGHT,
  LOGO_MARK_DARK,
};
