import type { PracticeEvaluation, PracticeFeedback, ToolPathPoint } from "../types/interaction";
import { idealPositions, pathLength, resampleByArcLength } from "./pathSampling";

function dist(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

const SAMPLE_N = 48;

/** Avalia trajetória do aluno vs ideal com reamostragem por comprimento. */
export function evaluatePracticePath(
  userPath: [number, number, number][],
  ideal: ToolPathPoint[],
  opts?: { tolerance?: number; protectedTouched?: boolean; minPoints?: number },
): PracticeEvaluation {
  const feedback: PracticeFeedback[] = [];
  const tolerance = opts?.tolerance ?? 0.18;
  const minPoints = opts?.minPoints ?? 4;

  if (userPath.length < minPoints || ideal.length < 2) {
    return {
      score: 0,
      pathAccuracy: 0,
      directionAccuracy: 0,
      coverageAccuracy: 0,
      depthAccuracy: 0.5,
      feedback: [
        {
          type: "error",
          message:
            userPath.length < minPoints
              ? "Trajetória insuficiente para avaliar. Arraste o instrumento com contato contínuo."
              : "Esta fase não possui trajetória ideal configurada.",
        },
      ],
    };
  }

  const userLen = pathLength(userPath);
  if (userLen < 0.08) {
    return {
      score: 0,
      pathAccuracy: 0,
      directionAccuracy: 0,
      coverageAccuracy: 0,
      depthAccuracy: 0.5,
      feedback: [
        {
          type: "error",
          message: "Movimento muito curto ou sem deslocamento real sobre a superfície.",
        },
      ],
    };
  }

  const idealPts = idealPositions(ideal);
  const userR = resampleByArcLength(userPath, SAMPLE_N);
  const idealR = resampleByArcLength(idealPts, SAMPLE_N);

  let sum = 0;
  for (let i = 0; i < SAMPLE_N; i++) sum += dist(userR[i], idealR[i]);
  const avgDist = sum / SAMPLE_N;
  const pathAccuracy = Math.max(0, Math.min(1, 1 - avgDist / (tolerance * 2.5)));

  // Direção por janelas locais reamostradas
  let dirSum = 0;
  let dirCount = 0;
  for (let i = 4; i < SAMPLE_N; i += 4) {
    const ua = userR[i - 4];
    const ub = userR[i];
    const ia = idealR[i - 4];
    const ib = idealR[i];
    const ud: [number, number, number] = [ub[0] - ua[0], ub[1] - ua[1], ub[2] - ua[2]];
    const idv: [number, number, number] = [ib[0] - ia[0], ib[1] - ia[1], ib[2] - ia[2]];
    const ul = Math.hypot(ud[0], ud[1], ud[2]) || 1;
    const il = Math.hypot(idv[0], idv[1], idv[2]) || 1;
    const dot = (ud[0] * idv[0] + ud[1] * idv[1] + ud[2] * idv[2]) / (ul * il);
    dirSum += Math.max(0, Math.min(1, (dot + 1) / 2));
    dirCount++;
  }
  const directionAccuracy = dirCount ? dirSum / dirCount : 0.5;

  // Cobertura espacial: fração dos pontos ideais próximos de algum ponto do aluno
  let covered = 0;
  for (const ip of idealR) {
    let hit = false;
    for (const up of userR) {
      if (dist(up, ip) < tolerance * 1.5) {
        hit = true;
        break;
      }
    }
    if (hit) covered++;
  }
  const coverageAccuracy = covered / idealR.length;

  // Profundidade: distância média ao centro — muito perto = excesso
  let centerSum = 0;
  for (const p of userR) centerSum += Math.hypot(p[0], p[1] * 0.6, p[2]);
  const avgCenter = centerSum / userR.length;
  const depthAccuracy = Math.max(0.15, Math.min(1, (avgCenter - 0.25) / 0.35));

  const startDist = dist(userR[0], idealR[0]);
  if (startDist < tolerance) {
    feedback.push({ type: "success", message: "O movimento começou no local correto." });
  } else {
    feedback.push({ type: "warning", message: "O ponto inicial ficou afastado da posição sugerida." });
  }

  if (directionAccuracy < 0.35) {
    feedback.push({ type: "error", message: "A direção do movimento foi invertida ou muito desviada." });
  } else if (directionAccuracy > 0.75) {
    feedback.push({ type: "success", message: "A direção geral do movimento está correta." });
  }

  if (pathAccuracy < 0.45) {
    feedback.push({ type: "error", message: "O instrumento se afastou demais da trajetória ideal." });
  } else if (pathAccuracy < 0.7) {
    feedback.push({
      type: "warning",
      message: "A trajetória precisa acompanhar melhor a superfície.",
    });
  }

  if (coverageAccuracy < 0.45) {
    feedback.push({
      type: "warning",
      region: "coverage",
      message: "Faltou trabalhar parte da região desta etapa.",
    });
  }

  if (depthAccuracy < 0.35) {
    feedback.push({
      type: "error",
      message: "Pressão/profundidade simulada excessiva (instrumento muito próximo do centro).",
    });
  }

  if (opts?.protectedTouched) {
    feedback.push({
      type: "error",
      region: "protect",
      message: "Uma região protegida (cíngulo/cristas/cervical) foi desgastada em excesso.",
    });
  }

  if (pathAccuracy > 0.8 && coverageAccuracy > 0.7) {
    feedback.push({ type: "success", message: "Bom controle do instrumento nesta tentativa." });
  }

  const score = Math.round(
    (pathAccuracy * 0.35 + directionAccuracy * 0.25 + coverageAccuracy * 0.25 + depthAccuracy * 0.15) *
      100,
  );

  return {
    score,
    pathAccuracy,
    directionAccuracy,
    coverageAccuracy,
    depthAccuracy,
    feedback,
  };
}
