/**
 * Atlas de anatomia dental — base limpa para reconstruir do zero.
 */

export type AtlasTreatment =
  | "explode"
  | "cinema"
  | "split"
  | "orbit"
  | "magazine"
  | "focus";

export interface AtlasHotspot {
  label: string;
  x: number;
  y: number;
  note: string;
}

export interface AtlasPiece {
  slideId: string;
  role: "lead" | "support" | "detail" | "compare";
  caption: string;
  note?: string;
  crop?: string;
  hotspots?: AtlasHotspot[];
}

export interface AtlasChapter {
  id: string;
  index: string;
  title: string;
  kicker: string;
  lead: string;
  treatment: AtlasTreatment;
  accent: "gold" | "sky" | "rose" | "mint";
  pieces: AtlasPiece[];
}

/** Capítulos do atlas — vazio para começar do zero. */
export const atlasChapters: AtlasChapter[] = [];

export const atlasHero = {
  brand: "GB Dental",
  title: "Anatomia dental",
  subtitle: "Espaço pronto para o novo conteúdo.",
  image: "",
};

export function atlasImage(_slideId: string) {
  return "";
}

export function atlasTitle(_slideId: string) {
  return "";
}
