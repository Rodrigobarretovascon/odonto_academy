/**
 * Cartões didáticos por etapa — estilo dente 11, para toda a arcada.
 * Pré-molares e molares incluem etapa de sulcos oclusais.
 */

import type { PhaseTeaching } from "./tooth-11-phases";
import { TOOTH_11_PHASES } from "./tooth-11-phases";
import type { ToothKind } from "./condensed-scripts";
import { phaseCountFor } from "./condensed-scripts";

function kindFromFdi(n: number): ToothKind {
  const p = n % 10;
  if (p === 1 || p === 2) return "incisor";
  if (p === 3) return "canine";
  if (p === 4 || p === 5) return "premolar";
  return "molar";
}

function anteriorTeaching(fdi: number): PhaseTeaching[] {
  return [
    {
      id: 1,
      title: "Preparar o bloco e orientar as faces",
      animPhase: "faces",
      time: "—",
      action: `Usar os valores da tabela oferecida acima; marcar altura nas 4 faces; identificar V, L, M e D do dente ${fdi}.`,
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron nas linhas de limite",
      remove: "Nada volumoso — só traços na cera",
      preserve: "Volume interno e orientação correta M ≠ D",
      result: `Bloco marcado e faces do ${fdi} definidas`,
      defaultView: "obliqua",
      removeOverlay: 0,
      preserveOverlay: 0.3,
    },
    {
      id: 2,
      title: "Desenhar as proximais e fazer a redução grosseira",
      animPhase: "rough-cut",
      time: "—",
      action:
        "Na face MESIAL, desenhar o perfil, reduzir cera fora da margem de segurança; depois repetir na DISTAL; convergência cervical.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron na face mesial (fora da linha verde)",
      remove: "Cera vermelha fora da margem",
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
      time: "—",
      action: `Arredondar quinas, ajustar bossa vestibular, desgastar mais a distal do ${fdi} e delimitar o colo.`,
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
      time: "—",
      action:
        "Modelar mesial côncavo→convexo, corrigir VL se largo, marcar cristas e escavar fossa na cera.",
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
      time: "—",
      action:
        "Definir ângulos mesial/distal da borda, corrigir largura×altura e detalhes vestibulares discretos.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron nos ângulos e detalhes",
      remove: "Excesso de cera lateral, cantos retos, excesso incisal",
      preserve: "Proporção e colo",
      result: "Anatomia vestibular e proporção ajustadas",
      defaultView: "V",
      removeOverlay: 0.35,
      preserveOverlay: 0.35,
    },
    {
      id: 6,
      title: "Refino, alisamento com Lecron e revisão final",
      animPhase: "polish",
      time: "—",
      action: "Refinar faces, alisar a cera com passes leves do Lecron e revisar o dente.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron em passes leves de alisamento",
      remove: "Micro-quinas e reto residual de cera",
      preserve: "Anatomia completa",
      result: `Dente ${fdi} didático final (cera + Lecron)`,
      defaultView: "obliqua",
      removeOverlay: 0.1,
      preserveOverlay: 0.15,
    },
  ];
}

function posteriorTeaching(fdi: number, kind: ToothKind): PhaseTeaching[] {
  const cuspHint =
    kind === "premolar"
      ? "Ajustar altura relativa das cúspides V/L"
      : "Definir cúspides e convergências oclusais";

  return [
    {
      id: 1,
      title: "Preparar o bloco e orientar as faces",
      animPhase: "faces",
      time: "—",
      action: `Usar os valores da tabela oferecida acima; marcar altura nas 4 faces; identificar V, L, M e D do dente ${fdi}.`,
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron nas linhas de limite",
      remove: "Nada volumoso — só traços na cera",
      preserve: "Volume interno e orientação correta M ≠ D",
      result: `Bloco marcado e faces do ${fdi} definidas`,
      defaultView: "obliqua",
      removeOverlay: 0,
      preserveOverlay: 0.3,
    },
    {
      id: 2,
      title: "Desenhar as proximais e fazer a redução grosseira",
      animPhase: "rough-cut",
      time: "—",
      action:
        "É interessante começar pelas proximais: na face MESIAL desenhar o perfil com margem de segurança; reduzir cera fora da margem; depois repetir na DISTAL.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron na face mesial (fora da linha verde)",
      remove: "Cera vermelha fora da margem",
      preserve: "Margem de segurança (verde) e colo",
      result: "Esboço grosseiro proximal com cera regular",
      defaultView: "M",
      removeOverlay: 0.5,
      preserveOverlay: 0.4,
    },
    {
      id: 3,
      title: "Arredondar a macroforma com o Lecron",
      animPhase: "round",
      time: "—",
      action: `Agora entra o arredondamento (sem quina): ajustar bossas e delimitar o colo do ${fdi} — é a fase da anatomia da aula.`,
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta de raspagem do Lecron",
      remove: "Quinas e excesso de cera",
      preserve: "Volume de coroa e colo",
      result: "Macroforma com “carinha” de dente",
      defaultView: "V",
      removeOverlay: 0.35,
      preserveOverlay: 0.35,
    },
    {
      id: 4,
      title: "Anatomia proximal, lingual e preparação oclusal",
      animPhase: "lingual",
      time: "—",
      action:
        "Trabalhar proximal (côncavo→convexo), corrigir VL se preciso e esboçar só o contorno das cúspides — ainda sem aprofundar sulcos.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron nas cristas e contorno oclusal",
      remove: "Excesso VL e cera fora do contorno de cúspides",
      preserve: "Cristas marginais e volume das cúspides",
      result: "Cúspides esboçadas; oclusal ainda sem sulcos profundos",
      defaultView: "L",
      removeOverlay: 0.4,
      preserveOverlay: 0.45,
    },
    {
      id: 5,
      title: "Proporção, cúspides e detalhes macro",
      animPhase: "detail",
      time: "—",
      action: `${cuspHint}; conferir proporção com a tabela; manter cera limpa para enxergar anatomia.`,
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron nas cúspides",
      remove: "Excesso que desequilibra altura das cúspides",
      preserve: "Proporção da tabela e colo",
      result: "Cúspides e proporção macro definidas",
      defaultView: "V",
      removeOverlay: 0.3,
      preserveOverlay: 0.35,
    },
    {
      id: 6,
      title: "Sulcos e fossas na oclusal",
      animPhase: "occlusal",
      time: "—",
      action:
        "FACE EM TRABALHO: OCLUSAL — primeiro o traçado leve dos sulcos; depois aprofundar em camadas finas; preservar cristas e pontas de cúspide (como nas videoaulas de oclusal).",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta fina do Lecron no fundo do sulco",
      remove: "Cera do fundo do sulco/fossa (vermelho didático)",
      preserve: "Cristas marginais e pontas de cúspide (verde)",
      result: "Padrão de sulcos oclusais limpo e raso",
      defaultView: "I",
      removeOverlay: 0.55,
      preserveOverlay: 0.5,
    },
    {
      id: 7,
      title: "Refino, alisamento com Lecron e revisão final",
      animPhase: "polish",
      time: "—",
      action: "Limpar aparas, alisar a cera, conferir tabela, colo e sulcos oclusais.",
      instrument: "Lecron + bloco de cera",
      activeTip: "Ponta do Lecron em passes leves de alisamento",
      remove: "Micro-quinas e farpas de cera",
      preserve: "Anatomia completa incluindo oclusal",
      result: `Dente ${fdi} didático final (cera + Lecron)`,
      defaultView: "obliqua",
      removeOverlay: 0.1,
      preserveOverlay: 0.15,
    },
  ];
}

/** Cartão didático da etapa para qualquer FDI. */
export function teachingForAnyTooth(
  toothNumber: number,
  phaseId: number,
): PhaseTeaching | undefined {
  // 11/21: cartões detalhados aprovados
  if (toothNumber === 11 || toothNumber === 21) {
    const p = TOOTH_11_PHASES.find((x) => x.id === phaseId);
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
      return { ...p, result: `Dente ${fdi} didático final (cera + Lecron + meia fina)` };
    }
    return p;
  }

  const kind = kindFromFdi(toothNumber);
  const phases =
    kind === "premolar" || kind === "molar"
      ? posteriorTeaching(toothNumber, kind)
      : anteriorTeaching(toothNumber);
  return phases.find((p) => p.id === phaseId);
}

export function expectedPhaseCount(toothNumber: number): number {
  return phaseCountFor(kindFromFdi(toothNumber));
}
