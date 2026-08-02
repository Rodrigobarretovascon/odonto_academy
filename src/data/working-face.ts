import type { AnimPhase } from "./sculpture-scripts";
import type { TeachingView } from "./tooth-11-phases";
import type { PhaseTeaching } from "./tooth-11-phases";

export interface WorkingFaceInfo {
  /** Código curto: V, L, M, D, O, I, ALL */
  code: string;
  /** Nome completo da face/vista */
  name: string;
  /** Texto do selo: FACE EM TRABALHO: MESIAL (M) */
  badge: string;
  /** Legenda sob a imagem */
  caption: string;
}

const FACE_MAP: Record<
  Exclude<TeachingView, "obliqua" | "I">,
  { code: string; name: string }
> = {
  V: { code: "V", name: "VESTIBULAR" },
  L: { code: "L", name: "LINGUAL" },
  M: { code: "M", name: "MESIAL" },
  D: { code: "D", name: "DISTAL" },
};

/**
 * Face/vista que a etapa está mostrando — sempre explícita para o aluno.
 */
export function workingFaceForPhase(
  teaching: Pick<PhaseTeaching, "defaultView" | "animPhase"> | undefined,
  opts?: { isPosterior?: boolean },
): WorkingFaceInfo {
  const view = teaching?.defaultView ?? "obliqua";
  const phase = teaching?.animPhase;
  const isPosterior = opts?.isPosterior ?? false;

  if (phase === "occlusal" || (view === "I" && isPosterior)) {
    return {
      code: "O",
      name: "OCLUSAL",
      badge: "FACE EM TRABALHO: OCLUSAL (O)",
      caption: "Vista oclusal",
    };
  }

  if (view === "I") {
    return {
      code: "I",
      name: "INCISAL",
      badge: "FACE EM TRABALHO: INCISAL (I)",
      caption: "Vista incisal",
    };
  }

  if (view === "obliqua" || phase === "faces" || phase === "polish") {
    return {
      code: "ALL",
      name: "V · L · M · D",
      badge: "FACES EM FOCO: V · L · M · D",
      caption: "Visão geral das faces",
    };
  }

  const mapped = FACE_MAP[view as keyof typeof FACE_MAP];
  if (mapped) {
    return {
      code: mapped.code,
      name: mapped.name,
      badge: `FACE EM TRABALHO: ${mapped.name} (${mapped.code})`,
      caption: `Vista ${mapped.name.toLowerCase()}`,
    };
  }

  return {
    code: "ALL",
    name: "V · L · M · D",
    badge: "FACES EM FOCO: V · L · M · D",
    caption: "Visão geral das faces",
  };
}

export function isPosteriorTooth(toothNumber: number): boolean {
  const p = toothNumber % 10;
  return p === 4 || p === 5 || p === 6 || p === 7;
}

/** Inferência leve a partir do animPhase do step, se não houver teaching. */
export function workingFaceFromAnimPhase(animPhase?: AnimPhase): WorkingFaceInfo {
  switch (animPhase) {
    case "faces":
    case "measure":
    case "instruments":
      return workingFaceForPhase({ defaultView: "obliqua", animPhase: "faces" });
    case "rough-cut":
    case "proximal-draw":
      return workingFaceForPhase({ defaultView: "M", animPhase: "rough-cut" });
    case "round":
    case "vestibular":
    case "detail":
      return workingFaceForPhase({ defaultView: "V", animPhase: "round" });
    case "lingual":
    case "cingulum":
      return workingFaceForPhase({ defaultView: "L", animPhase: "lingual" });
    case "occlusal":
    case "cusps":
      return workingFaceForPhase({ defaultView: "I", animPhase: "occlusal" }, { isPosterior: true });
    case "polish":
    default:
      return workingFaceForPhase({ defaultView: "obliqua", animPhase: "polish" });
  }
}
