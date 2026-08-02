import { describe, expect, it } from "vitest";
import { STEP_META, CATEGORY_LABEL } from "../data/stepMeta";
import { ALL_TOOL_ACTIONS } from "../data/tool-actions-central-upper";
import { FINAL_QUIZ } from "../data/finalQuiz";
import { COMMON_ERRORS } from "../data/commonErrors";
import { TOOL_ASSETS, getToolAsset } from "../data/toolAssets";
import { evaluatePracticePath } from "../lib/practiceEval";
import {
  resolvePracticeOutcome,
  detectProtectedHits,
} from "../lib/practiceOutcomes";
import {
  resampleByArcLength,
  validatePathProgress,
  pathLength,
} from "../lib/pathSampling";

describe("STEP_META — 24 fases", () => {
  it("tem metadados para fases 1–24", () => {
    for (let i = 1; i <= 24; i++) {
      expect(STEP_META[i], `fase ${i}`).toBeDefined();
      expect(STEP_META[i].order).toBe(i);
      expect(STEP_META[i].category in CATEGORY_LABEL).toBe(true);
      expect(STEP_META[i].why.length).toBeGreaterThan(10);
    }
  });
});

describe("tool actions — trajetórias", () => {
  it("paths têm progress monótono 0→1", () => {
    for (const [order, actions] of Object.entries(ALL_TOOL_ACTIONS)) {
      for (const a of actions) {
        const errs = validatePathProgress(a.path);
        expect(errs, `fase ${order} ${a.id}`).toEqual([]);
      }
    }
  });

  it("fases de desgaste com visualMode tool-path possuem actions", () => {
    for (let i = 1; i <= 24; i++) {
      const meta = STEP_META[i];
      if (meta.visualMode === "tool-path") {
        expect((ALL_TOOL_ACTIONS[i] ?? []).length, `fase ${i}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("pathSampling", () => {
  it("reamostra por comprimento", () => {
    const pts: [number, number, number][] = [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
    ];
    expect(pathLength(pts)).toBeCloseTo(2, 5);
    const r = resampleByArcLength(pts, 5);
    expect(r).toHaveLength(5);
    expect(r[0]).toEqual([0, 0, 0]);
    expect(r[4][0]).toBeCloseTo(1, 5);
    expect(r[4][1]).toBeCloseTo(1, 5);
  });
});

describe("practiceEval", () => {
  const ideal = [
    { position: [0, 0, 0.5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], progress: 0 },
    { position: [0, 0.2, 0.5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], progress: 0.5 },
    { position: [0, 0.4, 0.5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], progress: 1 },
  ];

  it("rejeita trajetória curta", () => {
    const r = evaluatePracticePath([[0, 0, 0]], ideal);
    expect(r.score).toBe(0);
    expect(r.feedback[0].type).toBe("error");
  });

  it("pontua bem caminho próximo ao ideal", () => {
    const user: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      user.push([0.01, (i / 20) * 0.4, 0.5]);
    }
    const r = evaluatePracticePath(user, ideal);
    expect(r.score).toBeGreaterThan(60);
  });
});

describe("practiceOutcomes", () => {
  it("detecta hit em cíngulo", () => {
    const hits = detectProtectedHits([[0, -0.28, -0.35]], ["cingulum"]);
    expect(hits.length).toBe(1);
    expect(hits[0].regionId).toBe("cingulum");
  });

  it("escolhe insufficient / expected / excessive", () => {
    expect(
      resolvePracticeOutcome(
        {
          score: 30,
          pathAccuracy: 0.3,
          directionAccuracy: 0.5,
          coverageAccuracy: 0.3,
          depthAccuracy: 0.8,
          feedback: [],
        },
        [],
      ),
    ).toBe("insufficient");
    expect(
      resolvePracticeOutcome(
        {
          score: 90,
          pathAccuracy: 0.9,
          directionAccuracy: 0.9,
          coverageAccuracy: 0.85,
          depthAccuracy: 0.8,
          feedback: [],
        },
        [],
      ),
    ).toBe("expected");
    expect(
      resolvePracticeOutcome(
        {
          score: 70,
          pathAccuracy: 0.7,
          directionAccuracy: 0.7,
          coverageAccuracy: 0.7,
          depthAccuracy: 0.2,
          feedback: [],
        },
        [{ regionId: "cingulum", duration: 0.2, penetration: 0.5 }],
      ),
    ).toBe("excessive");
  });
});

describe("final quiz e erros", () => {
  it("quiz tem 10 itens com resposta válida", () => {
    expect(FINAL_QUIZ).toHaveLength(10);
    for (const q of FINAL_QUIZ) {
      expect(q.choices.some((c) => c.id === q.correctId)).toBe(true);
    }
  });

  it("erros comuns apontam fases 1–24", () => {
    for (const e of COMMON_ERRORS) {
      expect(e.relatedStep).toBeGreaterThanOrEqual(1);
      expect(e.relatedStep).toBeLessThanOrEqual(24);
    }
  });
});

describe("tool assets fallback", () => {
  it("todos os instrumentos têm fallbackGeometry", () => {
    for (const id of ["ruler", "scalpel", "lecron", "brush", "nylon"]) {
      const a = getToolAsset(id);
      expect(a.fallbackGeometry).toBeTruthy();
      expect(TOOL_ASSETS[id]).toBeDefined();
    }
  });
});
