/**
 * Metadados didáticos condensados — 6 etapas (11/21).
 * Materiais: apenas cera + Lecron.
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
    title: "Preparar o bloco e orientar as faces",
    animPhase: "faces",
    time: "1:13–3:15",
    action:
      "Usar os valores da tabela oferecida acima; marcar altura nas 4 faces do bloco; identificar V, L, M e D.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron nas linhas de limite",
    remove: "Nada volumoso — só traços na cera",
    preserve: "Volume interno e orientação correta M ≠ D",
    result: "Bloco de cera marcado e faces definidas",
    defaultView: "obliqua",
    removeOverlay: 0,
    preserveOverlay: 0.3,
  },
  {
    id: 2,
    title: "Desenhar as proximais e fazer a redução grosseira",
    animPhase: "rough-cut",
    time: "3:15–8:54",
    action:
      "Na face MESIAL, desenhar o perfil, reduzir cera fora da margem de segurança; depois repetir na DISTAL; convergência cervical e cíngulo.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron na face mesial (fora da linha verde)",
    remove: "Cera vermelha fora da margem (MD e depois P)",
    preserve: "Margem de segurança (verde) e colo",
    result: "Esboço grosseiro com cera regular e faces proximais definidas",
    defaultView: "M",
    removeOverlay: 0.5,
    preserveOverlay: 0.4,
  },
  {
    id: 3,
    title: "Arredondar a macroforma com o Lecron",
    animPhase: "round",
    time: "8:54–13:48",
    action:
      "Arredondar quinas na cera, levar bossa para cervical, desgastar mais a distal e delimitar o colo.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta de raspagem do Lecron",
    remove: "Quinas e excesso de cera médio-vestibular / distal",
    preserve: "Volume de coroa e colo",
    result: "Macroforma com “carinha” de dente",
    defaultView: "V",
    removeOverlay: 0.35,
    preserveOverlay: 0.35,
  },
  {
    id: 4,
    title: "Anatomia proximal e fossa lingual",
    animPhase: "lingual",
    time: "14:07–17:38",
    action:
      "Modelar mesial côncavo→convexo, corrigir VL se largo, marcar crista e escavar fossa na cera.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta / colher do Lecron na fossa",
    remove: "Cera do interior da fossa e excesso VL",
    preserve: "Cristas marginais e contato",
    result: "Fossa esboçada e proximal trabalhada",
    defaultView: "L",
    removeOverlay: 0.5,
    preserveOverlay: 0.5,
  },
  {
    id: 5,
    title: "Borda incisal, proporção e detalhes vestibulares",
    animPhase: "detail",
    time: "17:56–22:22",
    action:
      "Definir MI ~90° e DI arredondado, corrigir largura×altura, sulcos/mamelões e recuperar cervical se preciso.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron nos ângulos e sulcos",
    remove: "Excesso de cera lateral, cantos retos, excesso incisal",
    preserve: "Proporção MI ≠ DI e colo",
    result: "Anatomia vestibular e proporção ajustadas",
    defaultView: "V",
    removeOverlay: 0.35,
    preserveOverlay: 0.35,
  },
  {
    id: 6,
    title: "Refino, alisamento com Lecron e revisão final",
    animPhase: "polish",
    time: "22:58–fim",
    action:
      "Refinar lingual, garantir M > D, alisar a cera com passes leves do Lecron e revisar o dente.",
    instrument: "Lecron + bloco de cera",
    activeTip: "Ponta do Lecron em passes leves de alisamento",
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
      action: `Usar os valores da tabela oferecida acima; marcar altura nas 4 faces; identificar V, L, M e D do dente ${fdi}.`,
      result: `Bloco marcado com os valores da tabela e faces do ${fdi} definidas`,
    };
  }
  if (phaseId === 3) {
    return {
      ...p,
      action: `Arredondar quinas, levar bossa para cervical, desgastar mais a distal do ${fdi} e delimitar o colo.`,
    };
  }
  if (phaseId === 6) {
    return {
      ...p,
      result: `Dente ${fdi} didático final (cera + Lecron)`,
    };
  }
  return p;
}
