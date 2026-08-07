import { formatPrice } from "../../lib/api";
import { centsToReaisInput, reaisToCents } from "./adminShared";
import { InlineEditRow } from "./InlineEditRow";

export type EditableProduct = {
  id: number;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  promo_price_cents: number | null;
  type: string;
  access_days: number;
  image_url: string | null;
  images?: Array<{ id: number; image_url: string; sort_order?: number }>;
  image_urls?: string[];
  badge: string | null;
  featured: boolean;
  active: boolean;
  stock_qty: number | null;
  characteristics: string[];
  applications: string[];
};

type Props = {
  product: EditableProduct;
  selected?: boolean;
  onPatch: (id: number, patch: Record<string, unknown>) => Promise<void>;
  onRemove: (id: number, name: string) => void;
  onPhotos: (id: number, files: File[]) => void;
  onRemoveImage: (productId: number, imageId: number) => void;
  onSetCover: (productId: number, imageId: number) => void;
  onSelect?: (id: number) => void;
};

const TYPE_LABELS: Record<string, string> = {
  physical: "Físico",
  subscription: "Assinatura / digital",
  digital: "Digital",
};

export function ProductInlineCard({
  product: p,
  selected,
  onPatch,
  onRemove,
  onPhotos,
  onRemoveImage,
  onSetCover,
  onSelect,
}: Props) {
  const gallery =
    p.images && p.images.length > 0
      ? p.images
      : p.image_url
        ? [{ id: 0, image_url: p.image_url }]
        : [];

  return (
    <article
      className={`admin-product-card admin-product-card--full${selected ? " is-editing" : ""}${!p.active ? " is-inactive" : ""}`}
    >
      <header className="admin-product-card__head">
        <div className="admin-product-card__media">
          {gallery[0] ? <img src={gallery[0].image_url} alt="" /> : <div className="admin-product-card__ph" />}
          <label className="btn-outline btn-outline--sm admin-upload">
            + Fotos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) onPhotos(p.id, files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="admin-product-card__title">
          <p className="admin-code">{p.code}</p>
          <h3>{p.name}</h3>
          <p className="admin-muted">
            {formatPrice(p.price_cents)}
            {p.promo_price_cents != null && <> · promo {formatPrice(p.promo_price_cents)}</>}
            {" · "}
            {p.active ? "ativo" : "inativo"}
            {gallery.length > 0 && (
              <>
                {" "}
                · {gallery.length} foto{gallery.length > 1 ? "s" : ""}
              </>
            )}
          </p>
          <div className="admin-form__actions">
            {onSelect && (
              <button type="button" className="btn-outline btn-outline--sm" onClick={() => onSelect(p.id)}>
                Destacar
              </button>
            )}
            <button type="button" className="btn-outline btn-outline--sm" onClick={() => onRemove(p.id, p.name)}>
              Remover
            </button>
          </div>
        </div>
      </header>

      <div className="admin-product-gallery">
        <p className="admin-product-gallery__label">Carrossel de imagens</p>
        <p className="admin-muted admin-muted--tight">
          Adicione várias fotos. A primeira é a capa. Use “Capa” para escolher outra.
        </p>
        <div className="admin-product-gallery__grid">
          {gallery.map((img, i) => (
            <figure
              key={img.id || img.image_url}
              className={`admin-product-gallery__item${i === 0 ? " is-cover" : ""}`}
            >
              <img src={img.image_url} alt="" />
              <figcaption>
                {i === 0 ? "Capa" : `#${i + 1}`}
                {img.id > 0 && (
                  <span className="admin-product-gallery__actions">
                    {i !== 0 && (
                      <button
                        type="button"
                        className="btn-outline btn-outline--sm"
                        onClick={() => onSetCover(p.id, img.id)}
                      >
                        Capa
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-outline btn-outline--sm"
                      onClick={() => onRemoveImage(p.id, img.id)}
                    >
                      Remover
                    </button>
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
          <label className="admin-product-gallery__add">
            <span>+ Adicionar</span>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) onPhotos(p.id, files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="admin-product-card__fields">
        <InlineEditRow label="Código" display={p.code} value={p.code} readOnly onSave={async () => undefined} />
        <InlineEditRow label="Nome" display={p.name} value={p.name} onSave={(v) => onPatch(p.id, { name: v.trim() })} />
        <InlineEditRow
          label="Subtítulo"
          display={p.subtitle || "—"}
          value={p.subtitle ?? ""}
          onSave={(v) => onPatch(p.id, { subtitle: v })}
        />
        <InlineEditRow
          label="Descrição"
          display={p.description || "—"}
          value={p.description ?? ""}
          multiline
          onSave={(v) => onPatch(p.id, { description: v })}
        />
        <InlineEditRow
          label="Preço unitário (R$)"
          display={formatPrice(p.price_cents)}
          value={centsToReaisInput(p.price_cents)}
          type="number"
          placeholder="0,00"
          onSave={(v) => onPatch(p.id, { price_cents: reaisToCents(v) })}
        />
        <InlineEditRow
          label="Preço promocional (R$)"
          display={p.promo_price_cents != null ? formatPrice(p.promo_price_cents) : "—"}
          value={p.promo_price_cents != null ? centsToReaisInput(p.promo_price_cents) : ""}
          type="number"
          placeholder="vazio = sem promo"
          onSave={(v) =>
            onPatch(p.id, {
              promo_price_cents: v.trim() === "" ? null : reaisToCents(v),
            })
          }
        />
        <InlineEditRow
          label="Estoque (unidades)"
          display={p.stock_qty == null ? "sem controle" : `${p.stock_qty} un.`}
          value={p.stock_qty == null ? "" : String(p.stock_qty)}
          type="number"
          placeholder="vazio = sem controle"
          onSave={(v) =>
            onPatch(p.id, {
              stock_qty: v.trim() === "" ? null : Number(v),
            })
          }
        />
        <InlineEditRow
          label="Tipo"
          display={TYPE_LABELS[p.type] ?? p.type}
          value={p.type}
          type="select"
          options={[
            { value: "physical", label: "Físico" },
            { value: "subscription", label: "Assinatura / digital" },
            { value: "digital", label: "Digital" },
          ]}
          onSave={(v) => onPatch(p.id, { type: v })}
        />
        <InlineEditRow
          label="Badge"
          display={p.badge || "—"}
          value={p.badge ?? ""}
          onSave={(v) => onPatch(p.id, { badge: v.trim() || null })}
        />
        <InlineEditRow
          label="Características"
          display={(p.characteristics ?? []).join(", ") || "—"}
          value={(p.characteristics ?? []).join(", ")}
          onSave={(v) =>
            onPatch(p.id, {
              characteristics: v
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <InlineEditRow
          label="Aplicações"
          display={(p.applications ?? []).join(", ") || "—"}
          value={(p.applications ?? []).join(", ")}
          onSave={(v) =>
            onPatch(p.id, {
              applications: v
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <InlineEditRow
          label="Destaque"
          display={p.featured ? "Sim" : "Não"}
          value={p.featured ? "true" : "false"}
          type="select"
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
          onSave={(v) => onPatch(p.id, { featured: v === "true" })}
        />
        <InlineEditRow
          label="Ativo"
          display={p.active ? "Sim" : "Não"}
          value={p.active ? "true" : "false"}
          type="select"
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
          onSave={(v) => onPatch(p.id, { active: v === "true" })}
        />
      </div>
    </article>
  );
}
