import { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  alt?: string;
  className?: string;
  imageClassName?: string;
  /** Auto-avança o carrossel (ms). 0 = desliga. */
  autoplayMs?: number;
  /** Mostra setas e bolinhas. Default true. */
  showControls?: boolean;
};

export function productImageSlides(product: {
  image_url?: string | null;
  image_urls?: string[];
  images?: Array<{ image_url: string }>;
}) {
  if (product.image_urls?.length) return product.image_urls.filter(Boolean);
  if (product.images?.length) return product.images.map((i) => i.image_url).filter(Boolean);
  return product.image_url ? [product.image_url] : [];
}

export function ProductImageCarousel({
  images,
  alt = "",
  className = "",
  imageClassName = "",
  autoplayMs = 3500,
  showControls = true,
}: Props) {
  const slides = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [slides.join("|")]);

  // Pré-carrega todas as fotos para a troca não ficar em branco
  useEffect(() => {
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [slides.join("|")]);

  useEffect(() => {
    if (slides.length < 2 || !autoplayMs || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [slides.length, autoplayMs, paused, slides.join("|")]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  if (slides.length === 0) {
    return (
      <div className={`product-carousel product-carousel--empty ${className}`.trim()}>
        <div className="product-carousel__ph" aria-hidden />
      </div>
    );
  }

  const safeIndex = Math.min(index, slides.length - 1);

  function pauseBriefly() {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 8000);
  }

  function go(delta: number) {
    pauseBriefly();
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return slides.length - 1;
      if (next >= slides.length) return 0;
      return next;
    });
  }

  return (
    <div
      className={`product-carousel ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null || slides.length < 2) return;
        const x = e.changedTouches[0]?.clientX ?? touchX.current;
        const dx = x - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 40) return;
        go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="product-carousel__stage">
        <div
          className="product-carousel__track"
          style={{ transform: `translate3d(-${safeIndex * 100}%, 0, 0)` }}
        >
          {slides.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={i === safeIndex ? alt : ""}
              className={`product-carousel__img ${imageClassName}${i === safeIndex ? " is-active" : ""}`.trim()}
              loading="eager"
              decoding="async"
              aria-hidden={i !== safeIndex}
              draggable={false}
            />
          ))}
        </div>
      </div>
      {slides.length > 1 && showControls && (
        <>
          <button
            type="button"
            className="product-carousel__nav product-carousel__nav--prev"
            aria-label="Imagem anterior"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="product-carousel__nav product-carousel__nav--next"
            aria-label="Próxima imagem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
          <div className="product-carousel__dots" role="tablist" aria-label="Imagens do produto">
            {slides.map((src, i) => (
              <button
                key={`${src}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                className={`product-carousel__dot${i === safeIndex ? " is-on" : ""}`}
                aria-label={`Imagem ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pauseBriefly();
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
