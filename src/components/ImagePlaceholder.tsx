import type { ToothImage } from "../types/tooth";

interface ImagePlaceholderProps {
  image?: ToothImage;
  variant?: "step" | "final" | "diagram";
  className?: string;
}

export function ImagePlaceholder({
  image,
  variant = "step",
  className = "",
}: ImagePlaceholderProps) {
  const variantClass = `image-figure--${variant}`;

  if (image?.src) {
    return (
      <figure className={`image-figure ${variantClass} ${className}`.trim()}>
        <div className="image-figure__frame">
          <img src={image.src} alt={image.alt} className="image-figure__img" loading="lazy" />
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
