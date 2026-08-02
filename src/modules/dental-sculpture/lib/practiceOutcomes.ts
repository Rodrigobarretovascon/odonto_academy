import type {
  PracticeEvaluation,
  PracticeMomentMarker,
  ProtectedRegionHit,
  ToolPathPoint,
} from "../types/interaction";
import { evaluatePracticePath } from "./practiceEval";

export type PracticeVisualOutcome = "insufficient" | "expected" | "excessive";

export function resolvePracticeOutcome(
  evaluation: PracticeEvaluation,
  protectedHits: ProtectedRegionHit[],
): PracticeVisualOutcome {
  const protectPenalty = protectedHits.some((h) => h.penetration > 0.35);
  if (protectPenalty || evaluation.depthAccuracy < 0.35) return "excessive";
  if (evaluation.score < 45 || evaluation.coverageAccuracy < 0.4) return "insufficient";
  if (evaluation.score > 82 && evaluation.coverageAccuracy > 0.7) return "expected";
  if (evaluation.pathAccuracy < 0.5) return "insufficient";
  return evaluation.score >= 60 ? "expected" : "insufficient";
}

/** Fator de morph visual relativo ao intervalo start→end da fase. */
export function outcomeBlendFactor(outcome: PracticeVisualOutcome): number {
  switch (outcome) {
    case "insufficient":
      return 0.45;
    case "excessive":
      return 1.18;
    case "expected":
    default:
      return 1;
  }
}

const PROTECTED_LABELS: Record<string, string> = {
  cingulum: "cíngulo",
  crm: "crista marginal mesial",
  crd: "crista marginal distal",
  "cervical-min": "região cervical mínima",
  boss: "bossa vestibular",
  sulcus: "sulco vestibular",
  "core-margin": "margem de segurança do núcleo",
  "fossa-center": "centro da fossa (excesso)",
};

export function describeProtectedHit(hit: ProtectedRegionHit): string {
  const name = PROTECTED_LABELS[hit.regionId] ?? hit.regionId;
  return `Estrutura comprometida: ${name} (contato ${Math.round(hit.duration * 1000)} ms).`;
}

/** Detecta proximidade do caminho do aluno a regiões protegidas (esferas aproximadas). */
export function detectProtectedHits(
  userPath: [number, number, number][],
  regionIds: string[],
): ProtectedRegionHit[] {
  const centers: Record<string, [number, number, number, number]> = {
    // x,y,z,radius
    cingulum: [0, -0.28, -0.35, 0.16],
    crm: [-0.22, 0.1, -0.32, 0.1],
    crd: [0.22, 0.1, -0.32, 0.1],
    "cervical-min": [0, -0.42, 0, 0.2],
    boss: [0, -0.15, 0.38, 0.14],
    sulcus: [0, 0.1, 0.42, 0.12],
    "core-margin": [0, 0.05, 0, 0.22],
  };

  const hits: ProtectedRegionHit[] = [];
  for (const id of regionIds) {
    const c = centers[id];
    if (!c) continue;
    let duration = 0;
    let maxPen = 0;
    for (const p of userPath) {
      const d = Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
      if (d < c[3]) {
        duration += 1 / 60;
        maxPen = Math.max(maxPen, 1 - d / c[3]);
      }
    }
    if (maxPen > 0) {
      hits.push({ regionId: id, duration: Math.max(duration, 1 / 60), penetration: maxPen });
    }
  }
  return hits;
}

export function buildPracticeMomentMarkers(
  userPath: [number, number, number][],
  ideal: ToolPathPoint[],
  protectedHits: ProtectedRegionHit[],
  evaluation: PracticeEvaluation,
): PracticeMomentMarker[] {
  const markers: PracticeMomentMarker[] = [];
  if (userPath.length < 2 || ideal.length < 2) return markers;

  const startDist = Math.hypot(
    userPath[0][0] - ideal[0].position[0],
    userPath[0][1] - ideal[0].position[1],
    userPath[0][2] - ideal[0].position[2],
  );
  markers.push({
    id: "start",
    progress: 0,
    kind: startDist < 0.2 ? "ok" : "warn",
    label: startDist < 0.2 ? "Início correto" : "Início afastado",
  });

  // Perda de contato: saltos grandes entre amostras
  for (let i = 1; i < userPath.length; i++) {
    const d = Math.hypot(
      userPath[i][0] - userPath[i - 1][0],
      userPath[i][1] - userPath[i - 1][1],
      userPath[i][2] - userPath[i - 1][2],
    );
    if (d > 0.28) {
      markers.push({
        id: `gap-${i}`,
        progress: i / (userPath.length - 1),
        kind: "warn",
        label: "Perda de contato",
      });
      break;
    }
  }

  if (evaluation.directionAccuracy < 0.4) {
    markers.push({
      id: "dir",
      progress: 0.45,
      kind: "error",
      label: "Mudança indevida de direção",
    });
  }

  if (evaluation.depthAccuracy < 0.4) {
    markers.push({
      id: "pressure",
      progress: 0.55,
      kind: "error",
      label: "Excesso de pressão simulada",
    });
  }

  if (protectedHits.length) {
    markers.push({
      id: "protect",
      progress: 0.65,
      kind: "error",
      label: "Contato com região protegida",
    });
  }

  markers.push({
    id: "end",
    progress: 1,
    kind: evaluation.coverageAccuracy > 0.55 ? "ok" : "warn",
    label: evaluation.coverageAccuracy > 0.55 ? "Finalização adequada" : "Cobertura incompleta",
  });

  return markers;
}

export function evaluatePracticeWithOutcome(
  userPath: [number, number, number][],
  ideal: ToolPathPoint[],
  opts?: { tolerance?: number; protectedRegionIds?: string[] },
) {
  const protectedHits = detectProtectedHits(userPath, opts?.protectedRegionIds ?? []);
  const evaluation = evaluatePracticePath(userPath, ideal, {
    tolerance: opts?.tolerance,
    protectedTouched: protectedHits.length > 0,
  });
  // Enrich feedback with specific structures
  for (const hit of protectedHits) {
    evaluation.feedback.push({
      type: "error",
      region: hit.regionId,
      message: describeProtectedHit(hit),
    });
  }
  const outcome = resolvePracticeOutcome(evaluation, protectedHits);
  const moments = buildPracticeMomentMarkers(userPath, ideal, protectedHits, evaluation);
  return { evaluation, outcome, protectedHits, moments };
}
