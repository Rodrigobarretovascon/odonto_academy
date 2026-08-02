import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ToolAssetDefinition } from "../types/interaction";
import { getToolAsset } from "../data/toolAssets";
import { WARN_MISSING_GLB_ONCE } from "./debugFlags";

const missingGlbUrls = new Set<string>();
const warnedGlbUrls = new Set<string>();

function metal(color: number, roughness = 0.28, metalness = 0.72) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    envMapIntensity: 0.8,
  });
}

export function makeProceduralRuler(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-ruler";
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.022, 0.055),
    new THREE.MeshStandardMaterial({
      color: 0xe8eef4,
      transparent: true,
      opacity: 0.88,
      roughness: 0.45,
      metalness: 0.15,
    }),
  );
  g.add(bar);
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x1e3a6e });
  for (let i = 0; i <= 10; i++) {
    const h = i % 5 === 0 ? 0.032 : 0.018;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.006, h, 0.002), tickMat);
    tick.position.set(-0.42 + i * 0.084, 0.02, 0.028);
    g.add(tick);
  }
  return g;
}

export function makeProceduralScalpel(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-scalpel";
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 0.58, 12),
    metal(0xa8b0ba, 0.4, 0.35),
  );
  handle.rotation.z = Math.PI / 2;

  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.04, 10), metal(0x8a929c));
  bolster.rotation.z = Math.PI / 2;
  bolster.position.x = 0.28;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.18, 0.01);
  shape.lineTo(0.22, 0);
  shape.lineTo(0.18, -0.012);
  shape.lineTo(0, -0.006);
  shape.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: false }),
    metal(0xdfe4ea, 0.18, 0.85),
  );
  blade.position.set(0.3, 0, -0.002);
  blade.name = "tip-blade";

  const safeArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0.42, 0.04, 0),
    0.12,
    0x3d9b6e,
    0.04,
    0.03,
  );
  safeArrow.name = "safe-dir";

  g.add(handle, bolster, blade, safeArrow);
  return g;
}

export function makeProceduralLecron(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-lecron";
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 0.88, 16),
    metal(0xc8cfd6, 0.32, 0.55),
  );
  handle.rotation.z = Math.PI / 2;

  const knife = new THREE.Mesh(
    new THREE.ConeGeometry(0.028, 0.16, 14),
    metal(0x9aa3ad, 0.22, 0.8),
  );
  knife.name = "tip-knife";
  knife.position.x = 0.5;
  knife.rotation.z = -Math.PI / 2;

  const spoonBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
    metal(0xa0a9b3, 0.2, 0.78),
  );
  spoonBowl.name = "tip-spoon";
  spoonBowl.position.x = -0.48;
  spoonBowl.rotation.z = Math.PI / 2;
  spoonBowl.scale.set(1, 0.7, 1.2);

  g.add(handle, knife, spoonBowl);
  g.userData.knife = knife;
  g.userData.spoon = spoonBowl;
  return g;
}

export function makeProceduralBrush(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-brush";
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.016, 0.42, 10),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 }),
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -0.12;

  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), metal(0xb0b6be));
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = 0.12;

  const bristles = new THREE.Group();
  bristles.name = "tip-brush";
  const bristleMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.85 });
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.12, 4), bristleMat);
    b.rotation.z = Math.PI / 2;
    b.position.set(0.22, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04);
    bristles.add(b);
  }
  g.add(handle, ferrule, bristles);
  return g;
}

export function makeProceduralFabric(): THREE.Group {
  const g = new THREE.Group();
  g.name = "tool-fabric";
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.18, 6, 4),
    new THREE.MeshStandardMaterial({
      color: 0xd8e0e8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9,
      metalness: 0,
    }),
  );
  cloth.name = "tip-fabric";
  const pos = cloth.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 8) * 0.012 + Math.cos(y * 6) * 0.008);
  }
  pos.needsUpdate = true;
  cloth.geometry.computeVertexNormals();
  g.add(cloth);
  return g;
}

export function makeProceduralTool(
  kind: ToolAssetDefinition["fallbackGeometry"],
): THREE.Group {
  switch (kind) {
    case "ruler":
      return makeProceduralRuler();
    case "scalpel":
      return makeProceduralScalpel();
    case "brush":
      return makeProceduralBrush();
    case "fabric":
      return makeProceduralFabric();
    case "lecron":
    default:
      return makeProceduralLecron();
  }
}

/**
 * Carrega GLB se existir; caso contrário (ou em erro) usa geometria procedural.
 * URLs ausentes são lembradas para não spammar o console.
 */
export function loadToolGroup(
  toolId: string,
  onReady: (group: THREE.Group, fromGlb: boolean) => void,
): () => void {
  const def = getToolAsset(toolId);
  const fallback = makeProceduralTool(def.fallbackGeometry);
  let cancelled = false;

  if (!def.glbUrl || missingGlbUrls.has(def.glbUrl)) {
    onReady(fallback, false);
    return () => {
      cancelled = true;
    };
  }

  const url = def.glbUrl;
  const loader = new GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      if (cancelled) return;
      const root = new THREE.Group();
      root.name = `tool-${toolId}-glb`;
      root.add(gltf.scene);
      if (def.scale) root.scale.set(...def.scale);
      if (def.rotationOffset) root.rotation.set(...def.rotationOffset);
      onReady(root, true);
    },
    undefined,
    () => {
      missingGlbUrls.add(url);
      if (WARN_MISSING_GLB_ONCE && !warnedGlbUrls.has(url)) {
        warnedGlbUrls.add(url);
        console.warn(`[dental-sculpture] GLB ausente/inválido — fallback procedural: ${url}`);
      }
      if (cancelled) return;
      onReady(fallback, false);
    },
  );

  return () => {
    cancelled = true;
  };
}

/** Expõe cache de miss para testes. */
export function __resetMissingGlbCache() {
  missingGlbUrls.clear();
  warnedGlbUrls.clear();
}
