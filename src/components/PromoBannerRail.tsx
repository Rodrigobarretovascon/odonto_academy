import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

type ActiveBanner = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
};

const ROTATE_MS = 6000;

/** Faixa rotativa de propaganda abaixo do header */
export function PromoBannerRail() {
  const [banners, setBanners] = useState<ActiveBanner[]>([]);
  const [index, setIndex] = useState(0);
  const lastLogged = useRef<{ id: number; at: number } | null>(null);

  useEffect(() => {
    api<ActiveBanner[]>("/banners/active")
      .then((list) => {
        setBanners(list);
        setIndex(0);
      })
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const current = banners[index];
    if (!current) return;
    const now = Date.now();
    const prev = lastLogged.current;
    if (prev && prev.id === current.id && now - prev.at < ROTATE_MS - 500) return;
    lastLogged.current = { id: current.id, at: now };
    void api(`/banners/${current.id}/impression`, { method: "POST" }).catch(() => undefined);
  }, [banners, index]);

  if (banners.length === 0) return null;

  const current = banners[index];
  const media = <img src={current.image_url} alt={current.title} className="promo-banner__img" />;

  return (
    <div className="promo-banner" role="region" aria-label="Propaganda">
      <div className="promo-banner__inner">
        {current.link_url ? (
          <a href={current.link_url} className="promo-banner__link" target="_blank" rel="noopener noreferrer">
            {media}
          </a>
        ) : (
          media
        )}
        {banners.length > 1 && (
          <div className="promo-banner__dots" aria-hidden="true">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                className={`promo-banner__dot${i === index ? " is-on" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
