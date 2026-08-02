export interface ToothImage {
  /** Caminho relativo em /public ou URL externa. Omitir para usar placeholder. */
  src?: string;
  alt: string;
  placeholderLabel: string;
}

export type SculptureAnimPhase =
  | "instruments"
  | "measure"
  | "thirds"
  | "grid"
  | "faces"
  | "proximal-draw"
  | "rough-cut"
  | "second-cut"
  | "round"
  | "vestibular"
  | "lingual"
  | "cingulum"
  | "cervix"
  | "cusps"
  | "occlusal"
  | "root"
  | "detail"
  | "polish";

export interface SculptureStep {
  id: number;
  title: string;
  instructions: string[];
  image?: ToothImage;
  /** Caminho esperado do vídeo da fase (ex.: /videos/tooth-13/fase-3.mp4) */
  video?: string;
  alert?: string;
  /** Fase visual da animação 3D in-app. */
  animPhase?: SculptureAnimPhase;
}

export interface BlockMeasure {
  label: string;
  value: string;
}

export interface ToothViewData {
  label: string;
  image?: ToothImage;
}

export interface ContralateralDifference {
  aspect: string;
  primaryTooth: string;
  contralateralTooth: string;
}

export interface ToothSculptureData {
  number: number;
  name: string;
  contralateralNumber: number;
  contralateralName: string;
  title: string;
  subtitle?: string;
  /** Caixa no canto superior direito — resumo do espelhamento contralateral */
  contralateralNote?: string;
  blockMeasures: BlockMeasure[];
  blockPreparation: string[];
  blockImage?: ToothImage;
  faceIdentification: SculptureStep;
  steps: SculptureStep[];
  finalViews: ToothViewData[];
  contralateralDifferences: ContralateralDifference[];
  alerts: string[];
}
