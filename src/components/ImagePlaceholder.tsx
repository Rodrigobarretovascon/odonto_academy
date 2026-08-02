import { useEffect, useState } from "react";
import type { ToothImage } from "../types/tooth";

interface ImagePlaceholderProps {
  image?: ToothImage;
  variant?: "step" | "final" | "diagram";
  className?: string;
  /** Prioridade de carregamento (imagem principal da etapa). */
  priority?: boolean;
}

export function ImagePlaceholder({
  image,
  variant = "step",
  className = "",
  priority = false,
}: ImagePlaceholderProps) {
  const variantClass = `image-figure--${variant}`;
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [image?.src]);

  if (image?.src && !broken) {
    return (
      <figure className={`image-figure ${variantClass} ${className}`.trim()}>
        <div className="image-figure__frame">
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className="image-figure__img"
            width={3072}
            height={2048}
            sizes={
              variant === "diagram"
                ? "(max-width: 768px) 100vw, min(1100px, 92vw)"
                : "(max-width: 768px) 100vw, 480px"
            }
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setBroken(true)}
          />
        </div>
      </figure>
    );
  }

  return (
    <figure
      className={`image-placeholder ${variantClass} ${className}`.trim()}
      aria-label={image?.placeholderLabel ?? "Imagem pendente"}
    >
      <div className="image-placeholder__inner">
        <span className="image-placeholder__icon" aria-hidden="true">
          ◫
        </span>
        <span className="image-placeholder__label">
          {image?.placeholderLabel ?? "Imagem pendente"}
        </span>
      </div>
    </figure>
  );
}
