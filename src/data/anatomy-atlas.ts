import { contentSlides } from "./content-manifest";

/** Peça visual do atlas — a imagem vira matéria, não slide de PDF. */
export type AtlasTreatment =
  | "explode"
  | "cinema"
  | "split"
  | "orbit"
  | "magazine"
  | "focus";

export interface AtlasHotspot {
  label: string;
  x: number; // %
  y: number;
  note: string;
}

export interface AtlasPiece {
  slideId: string;
  role: "lead" | "support" | "detail" | "compare";
  caption: string;
  note?: string;
  /** object-position para crop cinematográfico */
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

function img(id: string) {
  const slide = contentSlides.find((s) => s.id === id);
  if (!slide) throw new Error(`Slide ausente no manifest: ${id}`);
  return slide;
}

export function atlasImage(slideId: string) {
  return img(slideId).image;
}

export function atlasTitle(slideId: string) {
  return img(slideId).title;
}

/** Capítulos curatoriais — cada um com tratamento visual próprio. */
export const atlasChapters: AtlasChapter[] = [
  {
    id: "por-dentro",
    index: "01",
    title: "Por dentro do dente",
    kicker: "Estruturas",
    lead: "Camadas que a escultura precisa respeitar: esmalte, dentina, polpa e o que as sustenta.",
    treatment: "explode",
    accent: "gold",
    pieces: [
      {
        slideId: "anatomia-dente-estruturas",
        role: "lead",
        caption: "Explosão anatômica",
        note: "Do esmalte ao forame apical — cada camada com função.",
        crop: "50% 42%",
        hotspots: [
          { label: "Esmalte", x: 48, y: 18, note: "Proteção mais dura do corpo." },
          { label: "Dentina", x: 52, y: 38, note: "Corpo sensível sob o esmalte." },
          { label: "Polpa", x: 50, y: 55, note: "Vida do dente: vasos e nervos." },
          { label: "Periodonto", x: 68, y: 72, note: "Inserção e proteção ao redor." },
        ],
      },
      {
        slideId: "partes-dente",
        role: "support",
        caption: "Coroa · Colo · Raiz",
        crop: "50% 35%",
      },
      {
        slideId: "tecidos-dente",
        role: "detail",
        caption: "Tecidos",
        crop: "50% 40%",
      },
      {
        slideId: "anatomia-dente-completa",
        role: "detail",
        caption: "Visão integrada",
        crop: "50% 45%",
      },
    ],
  },
  {
    id: "mapa",
    index: "02",
    title: "Mapa da arcada",
    kicker: "Numeração",
    lead: "FDI, decídua e permanente — o endereço de cada dente na boca.",
    treatment: "orbit",
    accent: "sky",
    pieces: [
      {
        slideId: "numeracao-permanente",
        role: "lead",
        caption: "Permanente",
        note: "11–48: o sistema que organiza o guia de escultura.",
        crop: "50% 48%",
      },
      {
        slideId: "numeracao-decidua",
        role: "support",
        caption: "Decídua",
        crop: "50% 45%",
      },
      {
        slideId: "denticao-comparativa",
        role: "detail",
        caption: "Comparativo",
        crop: "50% 40%",
      },
      {
        slideId: "primeiros-dentinhos",
        role: "detail",
        caption: "Erupção",
        crop: "50% 35%",
      },
    ],
  },
  {
    id: "oclusal",
    index: "03",
    title: "A face que mastiga",
    kicker: "Oclusal",
    lead: "Cúspides, sulcos e fossas — o desenho que a cera precisa repetir com precisão.",
    treatment: "cinema",
    accent: "mint",
    pieces: [
      {
        slideId: "anatomia-oclusal",
        role: "lead",
        caption: "Anatomia oclusal",
        note: "Estude antes de esculpir molares e pré-molares.",
        crop: "50% 50%",
      },
    ],
  },
  {
    id: "periodonto",
    index: "04",
    title: "O que segura o dente",
    kicker: "Periodonto",
    lead: "Proteção e inserção — e o que acontece quando a doença avança.",
    treatment: "split",
    accent: "rose",
    pieces: [
      {
        slideId: "periodonto",
        role: "lead",
        caption: "Proteção e inserção",
        crop: "50% 40%",
      },
      {
        slideId: "gengiva-regioes",
        role: "support",
        caption: "Regiões gengivais",
        crop: "50% 42%",
      },
      {
        slideId: "gengivite-periodontite",
        role: "compare",
        caption: "Gengivite × Periodontite",
        crop: "50% 45%",
      },
      {
        slideId: "evolucao-periodontal",
        role: "compare",
        caption: "Evolução",
        crop: "50% 48%",
      },
    ],
  },
  {
    id: "cera",
    index: "05",
    title: "Mãos na cera",
    kicker: "Escultura",
    lead: "Instrumento e material — o gesto que transforma anatomia em forma.",
    treatment: "focus",
    accent: "gold",
    pieces: [
      {
        slideId: "instrumento-lecron",
        role: "lead",
        caption: "Lecron nº 5",
        note: "O traço fino dos sulcos e das faces.",
        crop: "50% 40%",
      },
      {
        slideId: "cera-escultura",
        role: "support",
        caption: "Por que a cera",
        crop: "50% 45%",
      },
    ],
  },
  {
    id: "face",
    index: "06",
    title: "Harmonia da face",
    kicker: "Estética",
    lead: "Lábios e nariz dialogam com a arcada — contexto que a escultura não pode ignorar.",
    treatment: "magazine",
    accent: "rose",
    pieces: [
      {
        slideId: "anatomia-labios",
        role: "lead",
        caption: "Lábios",
        crop: "50% 35%",
      },
      {
        slideId: "nariz",
        role: "support",
        caption: "Nariz",
        crop: "50% 40%",
      },
      {
        slideId: "anatomia-cranio",
        role: "detail",
        caption: "Crânio",
        crop: "50% 30%",
      },
    ],
  },
  {
    id: "cavidade",
    index: "07",
    title: "Dentro da boca",
    kicker: "Cavidade oral",
    lead: "Palato, úvula e papilas — o cenário onde o dente vive.",
    treatment: "orbit",
    accent: "sky",
    pieces: [
      {
        slideId: "palato-duro",
        role: "lead",
        caption: "Palato duro",
        crop: "50% 45%",
      },
      {
        slideId: "uvula",
        role: "support",
        caption: "Úvula",
        crop: "50% 40%",
      },
      {
        slideId: "papilas-linguais",
        role: "detail",
        caption: "Papilas",
        crop: "50% 48%",
      },
    ],
  },
];

export const atlasHero = {
  image: atlasImage("anatomia-dente-completa"),
  crop: "50% 50%",
  brand: "Gabriela Barreto Dental",
  title: "Atlas anatômico",
  subtitle: "Ensina, orienta e cuida — morfologia viva para quem esculpe.",
};
