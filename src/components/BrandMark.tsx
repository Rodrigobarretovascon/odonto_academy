/** Logos oficiais — Gabriela Barreto Dental */
const LOGO_FULL = "/images/brand/gbd-logo-full.png?v=2";
const LOGO_MARK = "/images/brand/gbd-logo-mark.png?v=2";

/** Marca compacta (GB + DENTAL) — só para espaços pequenos. */
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
    <img
      className={`gb-mark ${className}`}
      src={LOGO_MARK}
      alt=""
      width={width}
      height={height}
      decoding="async"
      style={{ width, height, objectFit: "contain" }}
    />
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
 * Logo principal (prioridade): monograma GB + GABRIELA BARRETO + DENTAL.
 * Em `sm`, usa a versão compacta só quando o espaço é apertado.
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
  const src = compact ? LOGO_MARK : LOGO_FULL;
  const heights = { sm: 44, md: 64, lg: 112 } as const;
  const h = heights[size];

  return (
    <span className={`gb-lockup gb-lockup--image gb-lockup--${size}${compact ? " gb-lockup--mark" : " gb-lockup--full"}`}>
      <img
        src={src}
        alt="Gabriela Barreto Dental"
        className="gb-lockup__img"
        height={h}
        decoding="async"
      />
    </span>
  );
}

export { HeartRule, LOGO_MARK as AI_MASCOT_SRC, LOGO_FULL, LOGO_MARK };
