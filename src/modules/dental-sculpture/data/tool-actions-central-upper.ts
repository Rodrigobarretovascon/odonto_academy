import type { ToolAction } from "../types/interaction";

function ringPath(
  radius: number,
  y: number,
  count: number,
  tipTowardCenter = true,
): ToolAction["path"] {
  const pts: ToolAction["path"] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const a = -Math.PI / 2 + t * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const look = tipTowardCenter ? Math.atan2(-z, -x) : Math.atan2(z, x);
    pts.push({
      position: [x, y, z],
      rotation: [0.25, look, 0.35],
      progress: t,
    });
  }
  return pts;
}

function linePath(
  from: [number, number, number],
  to: [number, number, number],
  count: number,
  rot: [number, number, number],
): ToolAction["path"] {
  const pts: ToolAction["path"] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    pts.push({
      position: [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      ],
      rotation: rot,
      progress: t,
    });
  }
  return pts;
}

function proximalProfile(x: number): ToolAction["path"] {
  const yz: [number, number][] = [
    [0.34, -0.46],
    [0.39, -0.18],
    [0.37, 0.12],
    [0.32, 0.38],
    [0.14, 0.52],
    [-0.02, 0.5],
    [-0.16, 0.36],
    [-0.24, 0.12],
    [-0.26, -0.1],
    [-0.3, -0.32],
    [-0.18, -0.48],
    [0.06, -0.54],
    [0.34, -0.46],
  ];
  return yz.map(([z, y], i) => ({
    position: [x, y, z] as [number, number, number],
    rotation: [0.2, x > 0 ? 1.2 : -1.2, 0.25] as [number, number, number],
    progress: i / (yz.length - 1),
  }));
}

/** Trajetórias por fase — corte/escultura/marcação/limpeza/acabamento. */
export const ALL_TOOL_ACTIONS: Record<number, ToolAction[]> = {
  1: [
    {
      id: "f1-ruler-mark",
      toolId: "ruler",
      movementType: "mark",
      activeTip: "ruler",
      inclineHint: "Régua quase paralela à face vestibular",
      removalStrength: 0.05,
      speed: 0.55,
      path: linePath([-0.35, 0.35, 0.55], [0.35, 0.35, 0.55], 12, [0, 0, 0]),
    },
    {
      id: "f1-scribe-ring",
      toolId: "scalpel",
      movementType: "mark",
      activeTip: "blade",
      inclineHint: "Estilete levemente inclinado, contato raso",
      removalStrength: 0.08,
      speed: 0.5,
      path: ringPath(0.52, 0.22, 48),
    },
  ],
  3: [
    {
      id: "f3-proximal-draw",
      toolId: "scalpel",
      movementType: "mark",
      activeTip: "blade",
      inclineHint: "Ponta raspa o perfil proximal sem cortar volume",
      removalStrength: 0.04,
      speed: 0.42,
      path: proximalProfile(-0.48),
    },
  ],
  4: [
    {
      id: "f4-cut-md",
      toolId: "scalpel",
      movementType: "cut",
      activeTip: "blade",
      inclineHint: "Lâmina mais perpendicular ao excesso lateral",
      removalRegion: "excess-proximal",
      removalStrength: 0.7,
      speed: 0.65,
      path: [
        { position: [0.85, 0.45, 0.25], rotation: [0.2, 1.2, 0.4], progress: 0 },
        { position: [0.62, 0.35, 0.2], rotation: [0.25, 1.1, 0.35], progress: 0.15 },
        { position: [0.55, 0.1, 0.15], rotation: [0.3, 1.0, 0.3], progress: 0.4 },
        { position: [0.52, -0.15, 0.1], rotation: [0.28, 0.95, 0.28], progress: 0.65 },
        { position: [0.5, -0.35, 0.05], rotation: [0.2, 0.9, 0.2], progress: 0.85 },
        { position: [0.72, -0.4, 0.2], rotation: [0.1, 1.0, 0.1], progress: 1 },
      ],
    },
  ],
  6: [
    {
      id: "f6-converge-m",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "knife",
      inclineHint: "Convergência mesial em direção à cervical",
      removalRegion: "lateral-m",
      removalStrength: 0.4,
      speed: 0.45,
      path: linePath([0.55, 0.45, 0.35], [0.38, -0.25, 0.2], 16, [0.3, 0.9, 0.3]),
    },
    {
      id: "f6-converge-d",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "knife",
      inclineHint: "Convergência distal em direção à cervical",
      removalRegion: "lateral-d",
      removalStrength: 0.4,
      speed: 0.45,
      path: linePath([-0.55, 0.45, 0.35], [-0.38, -0.25, 0.2], 16, [0.3, -0.9, 0.3]),
    },
  ],
  7: [
    {
      id: "f7-palatal-volume",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "spoon",
      inclineHint: "Preserve o cíngulo cervical; remova o plano excessivo acima",
      removalRegion: "palatal-flat",
      removalStrength: 0.35,
      speed: 0.4,
      path: [
        { position: [0.1, 0.4, -0.7], rotation: [0.7, 0, 0.2], progress: 0 },
        { position: [0.05, 0.2, -0.5], rotation: [0.8, 0.1, 0.15], progress: 0.35 },
        { position: [-0.05, 0.05, -0.45], rotation: [0.75, -0.1, 0.15], progress: 0.65 },
        { position: [0, 0.25, -0.55], rotation: [0.65, 0, 0.2], progress: 1 },
      ],
    },
  ],
  9: [
    {
      id: "f9-round-edges",
      toolId: "lecron",
      movementType: "round",
      activeTip: "knife",
      inclineHint: "Lecron acompanhando a convexidade da borda",
      removalRegion: "corners",
      removalStrength: 0.35,
      repetitions: 2,
      speed: 0.45,
      path: [
        { position: [0.7, 0.4, 0.35], rotation: [0.4, 0.8, 0.5], progress: 0 },
        { position: [0.55, 0.35, 0.45], rotation: [0.45, 0.5, 0.45], progress: 0.2 },
        { position: [0.35, 0.25, 0.55], rotation: [0.5, 0.1, 0.4], progress: 0.4 },
        { position: [0.1, 0.15, 0.58], rotation: [0.45, -0.2, 0.35], progress: 0.55 },
        { position: [-0.2, 0.05, 0.52], rotation: [0.4, -0.6, 0.3], progress: 0.7 },
        { position: [-0.45, -0.05, 0.4], rotation: [0.35, -0.9, 0.25], progress: 0.85 },
        { position: [-0.65, -0.15, 0.25], rotation: [0.25, -1.1, 0.15], progress: 1 },
      ],
    },
  ],
  10: [
    {
      id: "f10-boss",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "knife",
      inclineHint: "Vista proximal: maior convexidade no cervical",
      removalRegion: "mid-vestibular",
      removalStrength: 0.32,
      speed: 0.4,
      path: linePath([0.55, 0.35, 0.35], [0.5, -0.15, 0.42], 14, [0.35, 1.1, 0.25]),
    },
  ],
  11: [
    {
      id: "f11-cervical-ring",
      toolId: "lecron",
      movementType: "scrape",
      activeTip: "knife",
      inclineHint: "Levemente inclinado — acompanha o contorno cervical (sem sulco profundo)",
      removalRegion: "cervical-excess",
      removalStrength: 0.22,
      speed: 0.36,
      // Raio próximo à superfície (~0.48–0.50); y cervical suave (não sulco)
      path: ringPath(0.5, -0.04, 72).map((p, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2;
        return {
          ...p,
          position: [
            p.position[0] * 0.98,
            -0.04 + Math.sin(a * 2) * 0.012,
            p.position[2] * 0.98,
          ] as [number, number, number],
          rotation: [
            0.15 + 0.08 * Math.sin(a),
            p.rotation[1],
            0.22 + 0.06 * Math.cos(a),
          ] as [number, number, number],
        };
      }),
    },
  ],
  12: [
    {
      id: "f12-brush",
      toolId: "brush",
      movementType: "brush",
      activeTip: "brush",
      inclineHint: "Varredura leve — sem alterar anatomia",
      removalStrength: 0,
      speed: 0.75,
      path: [
        { position: [-0.4, 0.35, 0.55], rotation: [0.4, 0.2, 0], progress: 0 },
        { position: [0.4, 0.25, 0.55], rotation: [0.4, -0.2, 0], progress: 0.35 },
        { position: [-0.35, 0.05, 0.5], rotation: [0.35, 0.15, 0], progress: 0.65 },
        { position: [0.35, -0.1, 0.48], rotation: [0.3, -0.1, 0], progress: 1 },
      ],
    },
  ],
  13: [
    {
      id: "f13-mesial",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "knife",
      inclineHint: "Concavidade cervical discreta na mesial",
      removalRegion: "mesial-cervical",
      removalStrength: 0.3,
      speed: 0.4,
      path: proximalProfile(-0.5)
        .slice(0, 8)
        .map((p, i, arr) => ({ ...p, progress: i / Math.max(1, arr.length - 1) })),
    },
  ],
  15: [
    {
      id: "f15-fossa-scrape",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "spoon",
      inclineHint: "Colher do Lecron na fossa — cíngulo e cristas protegidos",
      removalRegion: "fossa-center",
      removalStrength: 0.4,
      repetitions: 3,
      speed: 0.38,
      path: [
        { position: [0.05, 0.35, -0.75], rotation: [0.6, 0, 0.2], progress: 0 },
        { position: [0.05, 0.28, -0.55], rotation: [0.75, 0.05, 0.15], progress: 0.12 },
        { position: [-0.08, 0.18, -0.48], rotation: [0.85, 0.2, 0.1], progress: 0.28 },
        { position: [0.1, 0.08, -0.45], rotation: [0.9, -0.15, 0.1], progress: 0.45 },
        { position: [-0.05, -0.02, -0.42], rotation: [0.85, 0.1, 0.12], progress: 0.6 },
        { position: [0.06, 0.1, -0.46], rotation: [0.8, -0.05, 0.15], progress: 0.75 },
        { position: [0, 0.2, -0.5], rotation: [0.7, 0, 0.18], progress: 0.88 },
        { position: [0.05, 0.32, -0.7], rotation: [0.55, 0, 0.2], progress: 1 },
      ],
    },
  ],
  16: [
    {
      id: "f16-crests",
      toolId: "lecron",
      movementType: "carve",
      activeTip: "spoon",
      inclineHint: "Centro da fossa; cristas laterais protegidas",
      removalRegion: "fossa-center",
      removalStrength: 0.28,
      speed: 0.36,
      path: linePath([-0.05, 0.25, -0.48], [0.05, -0.05, -0.42], 12, [0.85, 0, 0.1]),
    },
  ],
  17: [
    {
      id: "f17-cingulum",
      toolId: "lecron",
      movementType: "round",
      activeTip: "spoon",
      inclineHint: "Arredonde o cíngulo sem isolá-lo como esfera",
      removalRegion: "cingulum-edge",
      removalStrength: 0.22,
      speed: 0.35,
      path: ringPath(0.28, -0.32, 32).map((p) => ({
        ...p,
        position: [p.position[0] * 0.55, p.position[1], -0.4 + p.position[2] * 0.25] as [
          number,
          number,
          number,
        ],
      })),
    },
  ],
  20: [
    {
      id: "f20-sulcus",
      toolId: "lecron",
      movementType: "scrape",
      activeTip: "knife",
      inclineHint: "Pressão mínima — sulcos rasos",
      removalRegion: "vestibular-sulcus",
      removalStrength: 0.12,
      speed: 0.32,
      path: (() => {
        const a = linePath([-0.12, 0.35, 0.48], [-0.12, -0.05, 0.45], 10, [0.2, 0, 0.1]);
        const b = linePath([0.12, 0.35, 0.48], [0.12, -0.05, 0.45], 10, [0.2, 0, 0.1]);
        const all = [...a, ...b];
        return all.map((p, i) => ({
          ...p,
          progress: i / Math.max(1, all.length - 1),
        }));
      })(),
    },
  ],
  21: [
    {
      id: "f21-cervical-redo",
      toolId: "lecron",
      movementType: "scrape",
      activeTip: "knife",
      inclineHint: "Refaça o colo com movimentos curtos",
      removalRegion: "cervical-excess",
      removalStrength: 0.2,
      speed: 0.38,
      path: ringPath(0.54, -0.05, 40),
    },
  ],
  22: [
    {
      id: "f22-palatal-refine",
      toolId: "lecron",
      movementType: "smooth",
      activeTip: "spoon",
      inclineHint: "Pouco volume restante — passes mínimos",
      removalRegion: "fossa-center",
      removalStrength: 0.15,
      speed: 0.3,
      path: linePath([0.08, 0.22, -0.46], [-0.08, 0.05, -0.44], 10, [0.8, 0, 0.12]),
    },
  ],
  23: [
    {
      id: "f23-corners",
      toolId: "lecron",
      movementType: "round",
      activeTip: "knife",
      inclineHint: "Suavize apenas as transições abruptas",
      removalRegion: "corners",
      removalStrength: 0.18,
      speed: 0.4,
      path: linePath([0.48, 0.3, 0.4], [-0.48, 0.1, 0.4], 16, [0.35, 0, 0.25]),
    },
  ],
  24: [
    {
      id: "f24-polish",
      toolId: "nylon",
      movementType: "polish",
      activeTip: "fabric",
      inclineHint: "Meia fina acompanhando a superfície",
      removalStrength: 0.05,
      speed: 0.55,
      path: [
        { position: [-0.35, 0.4, 0.5], rotation: [0.5, 0.2, 0], progress: 0 },
        { position: [0.35, 0.3, 0.5], rotation: [0.5, -0.2, 0], progress: 0.25 },
        { position: [0.2, 0.1, -0.45], rotation: [0.7, 0, 0.1], progress: 0.55 },
        { position: [-0.2, -0.05, 0.35], rotation: [0.4, 0.1, 0], progress: 0.8 },
        { position: [0, 0.2, 0.45], rotation: [0.45, 0, 0], progress: 1 },
      ],
    },
  ],
};

export function toolActionsForStep(order: number): ToolAction[] {
  return ALL_TOOL_ACTIONS[order] ?? [];
}

/** @deprecated use ALL_TOOL_ACTIONS */
export const PRIORITY_TOOL_ACTIONS = ALL_TOOL_ACTIONS;
