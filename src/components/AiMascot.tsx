/** Odus — mascote oficial da Assistente IA do GB Dental. */
const AI_MASCOT_SRC = "/images/ai/assistente-mascote.png";

export function AiMascot({
  size = 48,
  className = "",
  label = "Odus, assistente IA do GB Dental",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const decorative = !label;
  return (
    <img
      className={`ai-mascot ${className}`.trim()}
      src={AI_MASCOT_SRC}
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      decoding="async"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export { AI_MASCOT_SRC };
