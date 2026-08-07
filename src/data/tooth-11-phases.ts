/**
 * Metadados didáticos condensados — 6 etapas (11/21).
 * Alinhado ao roteiro do vídeo de escultura em cera.
 */

import type { AnimPhase } from "./sculpture-scripts";

export type TeachingView = "V" | "L" | "M" | "D" | "I" | "obliqua";

export interface PhaseTeaching {
  id: number;
  title: string;
  animPhase: AnimPhase;
  time: string;
  action: string;
  instrument: string;
  activeTip: string;
  remove: string;
  preserve: string;
  result: string;
  defaultView: TeachingView;
  removeOverlay: number;
  preserveOverlay: number;
}

export const TOOTH_11_PHASES: PhaseTeaching[] = [
  {
    id: 1,
    title: "Materiais, medidas e faces",
    animPhase: "faces",
    time: "vídeo · início",
    action:
      "Separar materiais; planejar medidas com a régua; limitar as 4 faces; identificar V, P, M e D.",
    instrument: "Régua + Lecron + bloco de cera",
    activeTip: "Ponta do Lecron nas linhas de limite",
    remove: "Nada volumoso — só traços na cera",
    preserve: "Volume interno e orientação correta M ≠ D",
    result: "Bloco marcado e faces definidas",
    defaultView: "obliqua",
    removeOverlay: 0,
    preserveOverlay: 0.3,
  },
  {
    id: 2,
    title: "Desenho proximal e corte grosseiro",
    animPhase: "rough-cut",
    time: "vídeo · proximais",
    action:
      "Na MESIAL, desenhar o perfil com margem; cortar fora da margem; repetir na DISTAL (menor e mais empinada).",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron na face mesial (fora da margem)",
    remove: "Cera fora da margem de segurança",
    preserve: "Margem de segurança e colo",
    result: "Esboço grosseiro das duas proximais",
    defaultView: "M",
    removeOverlay: 0.5,
    preserveOverlay: 0.4,
  },
  {
    id: 3,
    title: "Convergência e macroforma",
    animPhase: "round",
    time: "vídeo · convergência",
    action:
      "Desenhar bordas, convergir paredes para o cervical e formar o cíngulo sem cortar reto.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron nas bordas e no cíngulo",
    remove: "Excesso que impede a convergência e o cíngulo",
    preserve: "Volume do colo",
    result: "Macroforma que já parece dente",
    defaultView: "V",
    removeOverlay: 0.35,
    preserveOverlay: 0.35,
  },
  {
    id: 4,
    title: "Arredondar e convexidade",
    animPhase: "lingual",
    time: "vídeo · arredondar",
    action:
      "Arredondar quinas, levar bossa para cervical, criar convexidade vestibular e delimitar o colo.",
    instrument: "Lecron + escova",
    activeTip: "Ponta de raspagem do Lecron; escova nas aparas",
    remove: "Quinas e excesso médio-vestibular / distal",
    preserve: "Volume de coroa e colo",
    result: "Macroforma arredondada com colo limpo",
    defaultView: "V",
    removeOverlay: 0.35,
    preserveOverlay: 0.4,
  },
  {
    id: 5,
    title: "Anatomia, proporção e detalhes",
    animPhase: "detail",
    time: "vídeo · anatomia",
    action:
      "Modelar proximal e fossa, cristas marginais, ângulos MI/DI, proporção altura×largura e sulcos discretos.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta / colher do Lecron na fossa e nos ângulos",
    remove: "Interior da fossa, excesso VL e cantos retos",
    preserve: "Cristas marginais, colo e proporção",
    result: "Anatomia e proporção definidas",
    defaultView: "L",
    removeOverlay: 0.45,
    preserveOverlay: 0.45,
  },
  {
    id: 6,
    title: "Refino e polimento",
    animPhase: "polish",
    time: "vídeo · acabamento",
    action:
      "Recuperar palatina/cervical se preciso, garantir M > D, alisar com Lecron e polir com meia fina.",
    instrument: "Lecron + meia fina",
    activeTip: "Passes leves do Lecron; meia fina no alisamento",
    remove: "Micro-quinas e reto residual de cera",
    preserve: "Anatomia completa",
    result: "Central superior didático final",
    defaultView: "obliqua",
    removeOverlay: 0.1,
    preserveOverlay: 0.15,
  },
];

export function phaseById(id: number): PhaseTeaching | undefined {
  return TOOTH_11_PHASES.find((p) => p.id === id);
}

export function teachingForTooth(toothNumber: number, phaseId: number): PhaseTeaching | undefined {
  if (toothNumber !== 11 && toothNumber !== 21) return undefined;
  const p = phaseById(phaseId);
  if (!p) return undefined;
  const fdi = toothNumber;
  if (phaseId === 1) {
    return {
      ...p,
      action: `Separar materiais; planejar medidas; marcar as 4 faces; identificar V, P, M e D do dente ${fdi}.`,
      result: `Bloco marcado e faces do ${fdi} definidas`,
    };
  }
  if (phaseId === 4) {
    return {
      ...p,
      action: `Arredondar quinas, levar bossa para cervical, criar convexidade e delimitar o colo do ${fdi}.`,
    };
  }
  if (phaseId === 6) {
    return {
      ...p,
      result: `Dente ${fdi} didático final (cera + Lecron + meia fina)`,
    };
  }
  return p;
}
