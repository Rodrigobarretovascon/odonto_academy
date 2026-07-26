import { useEffect } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
  label: string;
}

interface ImageLightboxProps {
  image: LightboxImage;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada — ${image.label}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="image-lightbox__close no-print"
        aria-label="Fechar"
        onClick={onClose}
      >
        ×
      </button>
      <figure className="image-lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.alt} className="image-lightbox__img" />
        <figcaption className="image-lightbox__caption">{image.label}</figcaption>
      </figure>
    </div>
  );
}
