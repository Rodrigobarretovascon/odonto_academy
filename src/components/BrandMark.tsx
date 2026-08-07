const LOGO_SRC = "/images/brand/gb-dental-logo.png?v=6";
const MARK_SRC = "/images/brand/gb-dental-mark.png?v=6";

/** Marca isolada (dente) — recorte da identidade visual. */
export function BrandMark({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      className={`gb-mark ${className}`}
      src={MARK_SRC}
      alt=""
      width={size}
      height={size}
      decoding="async"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

function HeartRule({ className = "" }: { className?: string }) {
  return (
    <span className={`gb-heart-rule ${className}`} aria-hidden>
      <span className="gb-heart-rule__line" />
      <svg className="gb-heart-rule__heart" width="10" height="9" viewBox="0 0 10 9" fill="none">
        <path
          d="M5 8.2C3.2 6.7.8 5.2.8 3.2.8 1.7 1.9.8 3.1.8c.7 0 1.4.3 1.9.9C5.5 1.1 6.2.8 6.9.8c1.2 0 2.3.9 2.3 2.4 0 2-2.4 3.5-4.2 5Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
      <span className="gb-heart-rule__line" />
    </span>
  );
}

/** Logo marca oficial — PNG original com fundo transparente. */
export function BrandLockup({
  size = "md",
}: {
  variant?: "horizontal" | "stacked";
  showRule?: boolean;
  size?: "sm" | "md" | "lg";
  mode?: "image" | "type";
}) {
  return (
    <span className={`gb-lockup gb-lockup--image gb-lockup--${size}`}>
      <img
        src={LOGO_SRC}
        alt="GB Dental — Ensina. Orienta. Cuida."
        className="gb-lockup__img"
        decoding="async"
      />
    </span>
  );
}

export { HeartRule };
