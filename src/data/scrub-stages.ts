export type ScrubToothKind = "incisor" | "canine" | "premolar" | "molar";

export type ScrubSceneId =
  | "block"
  | "cervical"
  | "faces"
  | "volume"
  | "edges"
  | "cusps"
  | "refine"
  | "final";

export interface ScrubStage {
  id: ScrubSceneId;
  title: string;
  /** Uma linha curta — apoio mínimo */
  hint: string;
}

const ANTERIOR: ScrubStage[] = [
  { id: "cervical", title: "Marcação da linha cervical", hint: "Arraste para desenhar a linha no bloco." },
  { id: "faces", title: "Marcação das faces", hint: "Arraste para revelar V · L · M · D." },
  { id: "volume", title: "Redução dos volumes", hint: "Arraste para remover o excesso de cera." },
  { id: "edges", title: "Definição das arestas", hint: "Arraste para arredondar cantos vivos." },
  { id: "refine", title: "Fossa, cíngulo e detalhes", hint: "Arraste para modelar a face lingual." },
  { id: "final", title: "Dente finalizado", hint: "Arraste até o acabamento completo." },
];

const POSTERIOR: ScrubStage[] = [
  { id: "cervical", title: "Marcação da linha cervical", hint: "Arraste para desenhar a linha no bloco." },
  { id: "faces", title: "Marcação das faces", hint: "Arraste para revelar V · L · M · D · O." },
  { id: "volume", title: "Redução dos volumes", hint: "Arraste para aproximar a forma da coroa." },
  { id: "edges", title: "Definição das arestas", hint: "Arraste para suavizar as paredes." },
  { id: "cusps", title: "Formação das cúspides", hint: "Arraste para erguer as cúspides." },
  { id: "refine", title: "Sulcos e fossas", hint: "Arraste para esculpir a oclusal." },
  { id: "final", title: "Dente finalizado", hint: "Arraste até o acabamento completo." },
];

export function scrubStagesForKind(kind: ScrubToothKind): ScrubStage[] {
  if (kind === "premolar" || kind === "molar") return POSTERIOR;
  return ANTERIOR;
}
