import * as THREE from "three";

/** Cores calibradas nos frames do vídeo (cera creme + tapete azul). */
export const LAB = {
  mat: 0x8fbbd9,
  wax: 0xf5efe0,
  waxShade: 0xe4d9c4,
  metal: 0xc5ccd4,
  metalDark: 0x8f98a3,
  cutterRed: 0xc62828,
  cutterBlack: 0x1a1a1a,
  brushBlue: 0x2b6cb0,
  tipActive: 0xf5c542,
} as const;

function metal(color: number = LAB.metal, roughness = 0.28, metalness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export function waxMaterial(opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color: LAB.wax,
    roughness: 0.88,
    metalness: 0.01,
    flatShading: false,
    transparent: opacity < 1,
    opacity,
  });
}

/**
 * Bloquinho de cera no estilo do vídeo:
 * prisma estreito (MD × VL) e alongado (eixo coroa–base).
 */
export function makeWaxBlock(): THREE.Mesh {
  // Proporção aproximada do vídeo: ~1,2 × 3,5 × 1,0 (MD × altura × VL)
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.45, 0.48, 2, 2, 2), waxMaterial());
  mesh.name = "wax-block";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Estilete tipo cutter vermelho (como no vídeo). */
export function makeRedCutter(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-cutter";

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.055, 0.52),
    new THREE.MeshStandardMaterial({ color: LAB.cutterRed, roughness: 0.62, metalness: 0.05 }),
  );
  // Chanfros / textura simples: faixas
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.112, 0.012, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xa61e1e, roughness: 0.7 }),
  );
  ridge.position.y = 0.028;

  const slider = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color: LAB.cutterBlack, roughness: 0.55 }),
  );
  slider.position.set(0, 0.02, -0.08);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.04, 0.08),
    metal(0xb0b6be, 0.35, 0.65),
  );
  nose.position.z = 0.28;

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.038, 0.26),
    metal(0xe8ecf0, 0.18, 0.9),
  );
  blade.position.set(0, -0.005, 0.48);
  blade.name = "tip-active";

  // Resíduo de cera na lâmina (detalhe do vídeo)
  const waxRes = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.01, 0.06),
    new THREE.MeshStandardMaterial({ color: LAB.wax, roughness: 0.95 }),
  );
  waxRes.position.set(0.006, 0.012, 0.42);

  g.add(body, ridge, slider, nose, blade, waxRes);
  g.userData.activeTip = blade;
  return g;
}

/** Lecron metálico: cabo knurled + ponta faca + colher. */
export function makeLecronCarver(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-lecron";

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.92, 16), metal());
  shaft.rotation.z = Math.PI / 2;

  // Knurl central (anéis)
  const knurlGroup = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.02, 0.0035, 6, 16),
      metal(LAB.metalDark, 0.4, 0.55),
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.x = -0.06 + i * 0.02;
    knurlGroup.add(ring);
  }

  const knife = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.14, 12), metal(LAB.metalDark, 0.2, 0.85));
  knife.position.x = 0.52;
  knife.rotation.z = -Math.PI / 2;
  knife.name = "tip-active";

  const spoon = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.7),
    metal(LAB.metalDark, 0.22, 0.8),
  );
  spoon.position.x = -0.5;
  spoon.rotation.z = Math.PI / 2;
  spoon.scale.set(1, 0.65, 1.15);

  g.add(shaft, knurlGroup, knife, spoon);
  g.userData.activeTip = knife;
  return g;
}

/** Escova de cabo azul (como no vídeo). */
export function makeBlueBrush(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-brush";

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.028, 0.42),
    new THREE.MeshStandardMaterial({ color: LAB.brushBlue, roughness: 0.55 }),
  );
  handle.position.z = -0.08;

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.02, 0.08), metal(0xb8bec6, 0.4, 0.5));
  neck.position.z = 0.16;

  const bristleMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.9 });
  const head = new THREE.Group();
  head.name = "tip-active";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.1, 5), bristleMat);
      b.position.set((col - 2.5) * 0.012, (row - 1.5) * 0.012, 0.26);
      head.add(b);
    }
  }

  g.add(handle, neck, head);
  g.userData.activeTip = head;
  return g;
}

/** Régua milimetrada translúcida. */
export function makeRuler(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-ruler";
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.018, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0xe8eef4,
      transparent: true,
      opacity: 0.82,
      roughness: 0.4,
      metalness: 0.12,
    }),
  );
  g.add(bar);
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x1e3a6e });
  for (let i = 0; i <= 12; i++) {
    const h = i % 5 === 0 ? 0.028 : 0.016;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.005, h, 0.002), tickMat);
    tick.position.set(-0.48 + i * 0.08, 0.016, 0.031);
    g.add(tick);
  }
  return g;
}

/** Meia-fina (lixa). */
export function makeSandpaper(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-sandpaper";
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.14),
    new THREE.MeshStandardMaterial({
      color: 0xc4b89a,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.y = 0.002;
  sheet.name = "tip-active";
  g.add(sheet);
  g.userData.activeTip = sheet;
  return g;
}

export type LabInstrument = "ruler" | "cutter" | "lecron" | "brush" | "sandpaper";

export function instrumentForPhase(animPhase: string, stepId: number): LabInstrument {
  if (stepId === 1) return "ruler";
  if (stepId === 13) return "brush";
  if (stepId === 21) return "sandpaper";
  if (stepId >= 9) return "lecron";
  if (
    animPhase === "measure" ||
    animPhase === "faces" ||
    animPhase === "proximal-draw" ||
    animPhase === "rough-cut" ||
    animPhase === "second-cut" ||
    stepId <= 8
  ) {
    return "cutter";
  }
  return "lecron";
}

/** Bandeja lateral com instrumentos em repouso (como no vídeo). */
export function makeInstrumentTray(active: LabInstrument): THREE.Group {
  const tray = new THREE.Group();
  tray.name = "instrument-tray";

  const place = (obj: THREE.Object3D, x: number, z: number, rotY = 0, scale = 1) => {
    obj.position.set(x, -0.74, z);
    obj.rotation.set(0, rotY, 0);
    obj.scale.setScalar(scale);
    tray.add(obj);
  };

  const cutter = makeRedCutter();
  const brush = makeBlueBrush();
  const lecron = makeLecronCarver();
  const ruler = makeRuler();
  const sand = makeSandpaper();

  // Em repouso no canto (direita), como no frame
  place(cutter, 1.15, 0.55, 0.4, active === "cutter" ? 0.001 : 0.85);
  place(brush, 1.25, 0.15, -0.2, active === "brush" ? 0.001 : 0.9);
  place(lecron, 1.05, -0.25, 0.6, active === "lecron" ? 0.001 : 0.75);
  place(ruler, 0.15, 1.05, 0.1, active === "ruler" ? 0.001 : 0.7);
  place(sand, 0.85, -0.55, 0.3, active === "sandpaper" ? 0.001 : 0.85);

  return tray;
}

export function makeActiveInstrument(kind: LabInstrument): THREE.Group {
  switch (kind) {
    case "ruler":
      return makeRuler();
    case "brush":
      return makeBlueBrush();
    case "sandpaper":
      return makeSandpaper();
    case "lecron":
      return makeLecronCarver();
    case "cutter":
    default:
      return makeRedCutter();
  }
}

/** Destaque amarelo na ponta ativa. */
export function highlightActiveTip(tool: THREE.Group, on: boolean) {
  const tip = tool.userData.activeTip as THREE.Object3D | undefined;
  if (!tip) return;
  tip.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (!m || !("emissive" in m)) return;
    if (on) {
      m.emissive = new THREE.Color(LAB.tipActive);
      m.emissiveIntensity = 0.45;
    } else {
      m.emissive = new THREE.Color(0x000000);
      m.emissiveIntensity = 0;
    }
  });
}
