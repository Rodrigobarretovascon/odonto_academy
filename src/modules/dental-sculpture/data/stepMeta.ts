import type { NarrationCue, PracticeGeometryOutcome } from "../types/interaction";

export type SculptureStepCategory =
  | "orientation"
  | "measurement"
  | "marking"
  | "cutting"
  | "carving"
  | "inspection"
  | "cleaning"
  | "finishing";

export type StepVisualMode =
  | "tool-path"
  | "highlight-faces"
  | "measure-overlay"
  | "symmetry-compare"
  | "instrument-swap"
  | "brush-clean"
  | "polish"
  | "grazing-light";

export interface StepMeta {
  order: number;
  category: SculptureStepCategory;
  visualMode: StepVisualMode;
  why: string;
  narrationCues?: NarrationCue[];
  practiceOutcomes?: PracticeGeometryOutcome;
  protectedRegionIds?: string[];
}

/** Metadados didáticos das 24 fases — fora dos componentes. */
export const STEP_META: Record<number, StepMeta> = {
  1: {
    order: 1,
    category: "measurement",
    visualMode: "tool-path",
    why: "Delimitar a mesma altura em todas as faces evita coroa assimétrica desde o início.",
    narrationCues: [
      { id: "1a", startProgress: 0, endProgress: 0.35, text: "A régua define a altura da coroa.", focusRegion: "height" },
      { id: "1b", startProgress: 0.35, endProgress: 1, text: "O traçado fecha o perímetro na mesma altura.", focusRegion: "ring" },
    ],
    practiceOutcomes: { expected: "height-ok", insufficient: "height-short", excessive: "height-deep" },
  },
  2: {
    order: 2,
    category: "orientation",
    visualMode: "highlight-faces",
    why: "Identificar V, L, M e D antes dos cortes evita inverter faces no meio da escultura.",
  },
  3: {
    order: 3,
    category: "marking",
    visualMode: "tool-path",
    why: "O contorno proximal é o limite de segurança: corta-se fora da linha, nunca sobre ela no início.",
    practiceOutcomes: { expected: "prox-mark", insufficient: "prox-partial", excessive: "prox-deep" },
  },
  4: {
    order: 4,
    category: "cutting",
    visualMode: "tool-path",
    why: "Cortes pequenos e progressivos removem excesso sem ultrapassar o desenho.",
    protectedRegionIds: ["core-margin"],
    practiceOutcomes: { expected: "rough-ok", insufficient: "rough-little", excessive: "rough-too-much" },
  },
  5: {
    order: 5,
    category: "inspection",
    visualMode: "symmetry-compare",
    why: "Simetria não significa mesial = distal; a distal pode ser um pouco mais curva.",
  },
  6: {
    order: 6,
    category: "carving",
    visualMode: "tool-path",
    why: "Os contornos proximais convergem para a cervical porque a coroa é mais estreita nessa região.",
    protectedRegionIds: ["cervical-min"],
    practiceOutcomes: { expected: "conv-ok", insufficient: "conv-wide", excessive: "conv-thin" },
  },
  7: {
    order: 7,
    category: "carving",
    visualMode: "tool-path",
    why: "O volume cervical lingual deve ser preservado para formar o cíngulo.",
    protectedRegionIds: ["cingulum"],
    practiceOutcomes: { expected: "cing-reserve", insufficient: "cing-flat", excessive: "cing-lost" },
  },
  8: {
    order: 8,
    category: "orientation",
    visualMode: "instrument-swap",
    why: "O Lecron permite desgaste controlado; o estilete serve aos grandes excessos.",
  },
  9: {
    order: 9,
    category: "carving",
    visualMode: "tool-path",
    why: "Transições contínuas eliminam o aspecto de bloco sem apagar volume anatômico.",
    practiceOutcomes: { expected: "round-ok", insufficient: "round-square", excessive: "round-thin" },
  },
  10: {
    order: 10,
    category: "carving",
    visualMode: "tool-path",
    why: "A bossa vestibular fica no terço cervical; o terço médio/incisal afina progressivamente.",
    practiceOutcomes: { expected: "boss-ok", insufficient: "boss-flat", excessive: "boss-over" },
  },
  11: {
    order: 11,
    category: "carving",
    visualMode: "tool-path",
    why: "A linha cervical define o limite da coroa sem criar sulco profundo.",
    protectedRegionIds: ["cervical-min", "boss"],
    practiceOutcomes: { expected: "cerv-ok", insufficient: "cerv-faint", excessive: "cerv-groove" },
  },
  12: {
    order: 12,
    category: "cleaning",
    visualMode: "brush-clean",
    why: "A escova só remove resíduos para você avaliar a anatomia — não esculpe.",
  },
  13: {
    order: 13,
    category: "carving",
    visualMode: "tool-path",
    why: "A face mesial tem concavidade cervical discreta e convexidade no restante do contorno.",
    practiceOutcomes: { expected: "mesial-ok", insufficient: "mesial-flat", excessive: "mesial-deep" },
  },
  14: {
    order: 14,
    category: "inspection",
    visualMode: "measure-overlay",
    why: "A espessura VL excessiva deixa o dente ‘grosso’; ajuste sem apagar cíngulo e cristas.",
    protectedRegionIds: ["cingulum", "crm", "crd"],
  },
  15: {
    order: 15,
    category: "carving",
    visualMode: "tool-path",
    why: "A fossa é central e rasa; cíngulo e cristas permanecem protegidos.",
    protectedRegionIds: ["cingulum", "crm", "crd"],
    practiceOutcomes: { expected: "fossa-ok", insufficient: "fossa-shallow", excessive: "fossa-deep" },
  },
  16: {
    order: 16,
    category: "carving",
    visualMode: "tool-path",
    why: "As cristas são preservadas enquanto a região central da face lingual é desgastada.",
    protectedRegionIds: ["crm", "crd", "cingulum"],
    practiceOutcomes: { expected: "crest-ok", insufficient: "crest-bulky", excessive: "crest-lost" },
  },
  17: {
    order: 17,
    category: "carving",
    visualMode: "tool-path",
    why: "O cíngulo deve ser arredondado e integrado — não uma esfera colada.",
    protectedRegionIds: ["cingulum"],
    practiceOutcomes: { expected: "cing-ok", insufficient: "cing-weak", excessive: "cing-ball" },
  },
  18: {
    order: 18,
    category: "inspection",
    visualMode: "symmetry-compare",
    why: "O ângulo distal é mais arredondado que o mesial, criando a assimetria natural do incisivo.",
  },
  19: {
    order: 19,
    category: "measurement",
    visualMode: "measure-overlay",
    why: "Correções de proporção exigem revisar colo, bossa, proximais e lingual em seguida.",
  },
  20: {
    order: 20,
    category: "carving",
    visualMode: "tool-path",
    why: "Sulcos vestibulares são rasos: só modulam luz e sombra, sem riscos profundos.",
    practiceOutcomes: { expected: "sulcus-ok", insufficient: "sulcus-none", excessive: "sulcus-deep" },
  },
  21: {
    order: 21,
    category: "carving",
    visualMode: "tool-path",
    why: "Após correções maiores, a cervical pode precisar ser refeita com menos margem de cera.",
    protectedRegionIds: ["cervical-min"],
  },
  22: {
    order: 22,
    category: "carving",
    visualMode: "tool-path",
    why: "No refinamento lingual há pouca margem: movimentos mínimos e revisão constante.",
    protectedRegionIds: ["cingulum", "crm", "crd"],
  },
  23: {
    order: 23,
    category: "inspection",
    visualMode: "grazing-light",
    why: "Luz rasante revela quinas artificiais que a luz frontal esconde.",
  },
  24: {
    order: 24,
    category: "finishing",
    visualMode: "polish",
    why: "A meia fina só suaviza irregularidades mínimas — não substitui a escultura.",
    protectedRegionIds: ["cingulum", "crm", "crd", "sulcus", "cervical-min"],
  },
};

export const CATEGORY_LABEL: Record<SculptureStepCategory, string> = {
  orientation: "Orientação",
  measurement: "Medição",
  marking: "Marcação",
  cutting: "Corte",
  carving: "Escultura",
  inspection: "Inspeção",
  cleaning: "Limpeza",
  finishing: "Acabamento",
};
