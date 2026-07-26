import { useState } from "react";
import type { ToothViewData } from "../types/tooth";
import { ImageLightbox, type LightboxImage } from "./ImageLightbox";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface ToothViewProps {
  views: ToothViewData[];
}

export function ToothView({ views }: ToothViewProps) {
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);

  return (
    <>
      <section className="tooth-view" aria-labelledby="final-views-heading">
        <header className="tooth-view__header">
          <span className="instruction-card__number">9</span>
          <h2 id="final-views-heading" className="tooth-view__title">
            Resultado final — vistas
          </h2>
        </header>

        <p className="tooth-view__hint no-print">Clique em uma vista para ampliar.</p>

        <div className="tooth-view__grid">
          {views.map((view) => (
            <div key={view.label} className="tooth-view__item">
              {view.image?.src ? (
                <button
                  type="button"
                  className="tooth-view__zoom-trigger"
                  aria-label={`Ampliar vista ${view.label}`}
                  onClick={() => {
                    const src = view.image!.src!;
                    setLightbox({
                      src,
                      alt: view.image!.alt ?? view.label,
                      label: view.label,
                    });
                  }}
                >
                  <ImagePlaceholder
                    image={view.image}
                    variant="final"
                    className="tooth-view__image"
                  />
                </button>
              ) : (
                <ImagePlaceholder
                  image={view.image}
                  variant="final"
                  className="tooth-view__image"
                />
              )}
              <span className="tooth-view__label">{view.label}</span>
            </div>
          ))}
        </div>
      </section>

      {lightbox && <ImageLightbox image={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
