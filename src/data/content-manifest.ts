/** Gerado por scripts/import-conteudos-pdf.py — não editar manualmente. */

export type ContentCategory =
  | "decidua"
  | "denticao"
  | "anatomia"
  | "oclusal"
  | "escultura"
  | "estetica"
  | "periodonto";

export interface ContentSlide {
  id: string;
  page: number;
  title: string;
  category: ContentCategory;
  tags: string[];
  image: string;
}

export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  decidua: "Dentição decídua",
  denticao: "Dentição permanente",
  anatomia: "Anatomia",
  oclusal: "Oclusal",
  escultura: "Escultura em cera",
  estetica: "Estética facial",
  periodonto: "Periodonto",
};

export const contentSlides: ContentSlide[] = 
[
  {
    "page": 1,
    "id": "primeiros-dentinhos",
    "title": "Primeiros Dentinhos",
    "category": "decidua",
    "tags": [
      "erupção",
      "infantil"
    ],
    "image": "/images/content/conteudos/primeiros-dentinhos.png"
  },
  {
    "page": 2,
    "id": "denticao-comparativa",
    "title": "Primeira dentição e dentição permanente",
    "category": "denticao",
    "tags": [
      "arcada"
    ],
    "image": "/images/content/conteudos/denticao-comparativa.png"
  },
  {
    "page": 3,
    "id": "numeracao-permanente",
    "title": "Numeração FDI — dentição permanente",
    "category": "denticao",
    "tags": [
      "FDI"
    ],
    "image": "/images/content/conteudos/numeracao-permanente.png"
  },
  {
    "page": 4,
    "id": "numeracao-decidua",
    "title": "Numeração FDI — dentes decíduos",
    "category": "decidua",
    "tags": [
      "FDI",
      "leite"
    ],
    "image": "/images/content/conteudos/numeracao-decidua.png"
  },
  {
    "page": 5,
    "id": "anatomia-oclusal",
    "title": "Anatomia oclusal para restaurações",
    "category": "oclusal",
    "tags": [
      "restauração"
    ],
    "image": "/images/content/conteudos/anatomia-oclusal.png"
  },
  {
    "page": 6,
    "id": "anatomia-dente-estruturas",
    "title": "Anatomia do dente — estruturas externas e internas",
    "category": "anatomia",
    "tags": [
      "esmalte",
      "polpa"
    ],
    "image": "/images/content/conteudos/anatomia-dente-estruturas.png"
  },
  {
    "page": 7,
    "id": "instrumento-lecron",
    "title": "Lecron nº 5",
    "category": "escultura",
    "tags": [
      "instrumento",
      "cera"
    ],
    "image": "/images/content/conteudos/instrumento-lecron.png"
  },
  {
    "page": 8,
    "id": "cera-escultura",
    "title": "Para que serve a cera para escultura dental?",
    "category": "escultura",
    "tags": [
      "cera",
      "material"
    ],
    "image": "/images/content/conteudos/cera-escultura.png"
  },
  {
    "page": 9,
    "id": "anatomia-labios",
    "title": "Anatomia dos lábios",
    "category": "estetica",
    "tags": [
      "face"
    ],
    "image": "/images/content/conteudos/anatomia-labios.png"
  },
  {
    "page": 10,
    "id": "anatomia-cranio",
    "title": "Anatomia do crânio",
    "category": "anatomia",
    "tags": [
      "ossos"
    ],
    "image": "/images/content/conteudos/anatomia-cranio.png"
  },
  {
    "page": 11,
    "id": "palato-duro",
    "title": "Palato duro",
    "category": "anatomia",
    "tags": [
      "cavidade oral"
    ],
    "image": "/images/content/conteudos/palato-duro.png"
  },
  {
    "page": 12,
    "id": "uvula",
    "title": "Úvula",
    "category": "anatomia",
    "tags": [
      "palato mole"
    ],
    "image": "/images/content/conteudos/uvula.png"
  },
  {
    "page": 13,
    "id": "nariz",
    "title": "Nariz",
    "category": "estetica",
    "tags": [
      "face"
    ],
    "image": "/images/content/conteudos/nariz.png"
  },
  {
    "page": 14,
    "id": "partes-dente",
    "title": "Partes do dente — coroa, colo e raiz",
    "category": "anatomia",
    "tags": [
      "coroa",
      "raiz"
    ],
    "image": "/images/content/conteudos/partes-dente.png"
  },
  {
    "page": 15,
    "id": "tecidos-dente",
    "title": "Tecidos do dente",
    "category": "anatomia",
    "tags": [
      "esmalte",
      "dentina"
    ],
    "image": "/images/content/conteudos/tecidos-dente.png"
  },
  {
    "page": 16,
    "id": "periodonto",
    "title": "Periodonto — proteção e inserção",
    "category": "periodonto",
    "tags": [],
    "image": "/images/content/conteudos/periodonto.png"
  },
  {
    "page": 17,
    "id": "gengiva-regioes",
    "title": "Gengiva — principais regiões anatômicas",
    "category": "periodonto",
    "tags": [
      "gengiva"
    ],
    "image": "/images/content/conteudos/gengiva-regioes.png"
  },
  {
    "page": 18,
    "id": "anatomia-dente-completa",
    "title": "Anatomia do dente — coroa, colo, raiz e tecidos",
    "category": "anatomia",
    "tags": [],
    "image": "/images/content/conteudos/anatomia-dente-completa.png"
  },
  {
    "page": 19,
    "id": "gengivite-periodontite",
    "title": "Gengivite × Periodontite",
    "category": "periodonto",
    "tags": [
      "doença"
    ],
    "image": "/images/content/conteudos/gengivite-periodontite.png"
  },
  {
    "page": 20,
    "id": "evolucao-periodontal",
    "title": "Evolução da doença periodontal",
    "category": "periodonto",
    "tags": [
      "doença"
    ],
    "image": "/images/content/conteudos/evolucao-periodontal.png"
  },
  {
    "page": 21,
    "id": "papilas-linguais",
    "title": "Papilas linguais",
    "category": "anatomia",
    "tags": [
      "língua"
    ],
    "image": "/images/content/conteudos/papilas-linguais.png"
  }
];
