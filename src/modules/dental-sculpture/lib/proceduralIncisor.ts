import * as THREE from "three";

/**
 * Geometria procedural de incisivo central superior (FDI 11).
 * Contorno vestibular assimétrico, cíngulo, fossa e cristas — não um bloco genérico.
 */
function buildCrownProfile(segments = 48): THREE.Vector2[] {
  // Contorno proximal em YZ → depois extrude com largura MD variável
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // y: cervical (−) → incisal (+)
    const y = -0.52 + t * 1.05;
    // z vestibular/lingual: convexidade V + fossa P + cíngulo
    let zV = 0.22 + 0.1 * Math.exp(-Math.pow((y + 0.22) / 0.28, 2)); // bossa cervical
    zV += 0.04 * (1 - Math.abs(y - 0.15) / 0.6); // convexidade geral
    let zP = -0.18;
    if (y < -0.15) {
      // cíngulo
      zP = -0.22 - 0.12 * Math.exp(-Math.pow((y + 0.32) / 0.18, 2));
    } else {
      // fossa
      zP = -0.12 - 0.14 * Math.sin(((y + 0.15) / 0.7) * Math.PI);
    }
    // Use mid profile for Lathe-like — we'll use Shape for MD silhouette instead
    void zV;
    void zP;
    pts.push(new THREE.Vector2(0.32 - t * 0.08, y));
  }
  return pts;
}

/** Silhueta vestibular (x,y): mesial mais reta, distal mais convexa, convergência cervical. */
export function vestibularOutline(): THREE.Vector2[] {
  return [
    new THREE.Vector2(-0.22, -0.48), // cervical mesial
    new THREE.Vector2(-0.28, -0.2),
    new THREE.Vector2(-0.34, 0.05),
    new THREE.Vector2(-0.38, 0.28), // mesial quase reto
    new THREE.Vector2(-0.36, 0.42),
    new THREE.Vector2(-0.22, 0.5), // MI ~ângulo
    new THREE.Vector2(0, 0.52),
    new THREE.Vector2(0.2, 0.5),
    new THREE.Vector2(0.34, 0.42), // DI mais arredondado
    new THREE.Vector2(0.4, 0.28),
    new THREE.Vector2(0.38, 0.05),
    new THREE.Vector2(0.3, -0.2),
    new THREE.Vector2(0.22, -0.48), // cervical distal
  ];
}

function displaceIncisor(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const { x, y, z } = v;
    // Convergência cervical (estreita em y baixo)
    const cervicalTaper = 1 - Math.max(0, (-0.15 - y) / 0.4) * 0.28;
    // Largura maior no terço incisal
    const incisalWide = 1 + Math.max(0, (y - 0.1) / 0.45) * 0.12;
    // Distal mais convexa que mesial
    const distalBulge = x > 0 ? 1 + Math.abs(x) * 0.1 : 1 - Math.abs(x) * 0.03;
    let nx = x * cervicalTaper * incisalWide * distalBulge;

    // Bossa vestibular no cervical
    let nz = z;
    if (z > 0) {
      const boss = 0.07 * Math.exp(-Math.pow((y + 0.22) / 0.24, 2)) * (1 - Math.abs(x) / 0.45);
      nz += boss;
      // Depressões vestibulares suaves (lóbulos)
      const sulcus = 0.015 * Math.sin(x * 8.5) * Math.max(0, 1 - Math.abs(y - 0.08) / 0.42);
      nz -= sulcus;
      // Largura maior no terço incisal (vista V)
      if (y > 0.2) nx *= 1.02;
    } else {
      // Cíngulo mais definido
      if (y < -0.12) {
        const cing = 0.11 * Math.exp(-Math.pow((y + 0.3) / 0.15, 2)) * (1 - Math.abs(x) / 0.32);
        nz -= cing;
      } else {
        // Fossa central + cristas marginais (preservadas nas bordas x)
        const fossa = 0.1 * Math.sin(((y + 0.08) / 0.55) * Math.PI);
        const crestProtect = Math.min(1, Math.abs(x) / 0.26);
        nz += fossa * (1 - crestProtect * 0.9);
      }
    }

    // MI mais angular / DI mais arredondado
    if (x < -0.28 && y > 0.38) {
      nx *= 0.97;
    }
    if (x > 0.25 && y > 0.35) {
      const r = Math.hypot(x - 0.2, y - 0.36);
      if (r < 0.22) {
        nx *= 0.9 + r * 0.5;
      }
    }

    pos.setXYZ(i, nx, y, nz);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

/**
 * Mesh de cera com anatomia de IC superior.
 * `detail` 0–1 controla quanto das características aparecem (morph didático).
 */
export function createProceduralIncisor(detail = 1): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.78, 1.05, 0.55, 24, 32, 18);
  displaceIncisor(geo);
  // Suaviza um pouco com escala de detalhe
  if (detail < 1) {
    const pos = geo.attributes.position;
    const base = new THREE.BoxGeometry(0.78, 1.05, 0.55, 24, 32, 18);
    const bp = base.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        bp.getX(i) + (pos.getX(i) - bp.getX(i)) * detail,
        bp.getY(i) + (pos.getY(i) - bp.getY(i)) * detail,
        bp.getZ(i) + (pos.getZ(i) - bp.getZ(i)) * detail,
      );
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    base.dispose();
  }

  const mat = new THREE.MeshStandardMaterial({
    color: 0xc5dde0,
    roughness: 0.52,
    metalness: 0.02,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "procedural-incisor-11";
  return mesh;
}

/** Variantes de erro didático (galeria). */
export type CommonErrorId =
  | "too-wide"
  | "too-narrow"
  | "thin-cervical"
  | "flat-vestibular"
  | "too-square"
  | "symmetric-md"
  | "no-cingulum"
  | "shallow-fossa"
  | "deep-fossa"
  | "lost-crests"
  | "deep-sulci"
  | "over-polish";

export function createErrorIncisor(errorId: CommonErrorId): THREE.Mesh {
  const mesh = createProceduralIncisor(1);
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let { x, y, z } = v;
    switch (errorId) {
      case "too-wide":
        x *= 1.22;
        break;
      case "too-narrow":
        x *= 0.78;
        break;
      case "thin-cervical":
        if (y < -0.15) x *= 0.65;
        break;
      case "flat-vestibular":
        if (z > 0) z *= 0.45;
        break;
      case "too-square":
        x = Math.sign(x) * Math.min(Math.abs(x) * 1.05, 0.4);
        break;
      case "symmetric-md":
        x = Math.sign(x) * Math.abs(x);
        break;
      case "no-cingulum":
        if (z < 0 && y < -0.1) z *= 0.35;
        break;
      case "shallow-fossa":
        if (z < 0 && y > -0.1) z *= 0.55;
        break;
      case "deep-fossa":
        if (z < 0 && y > -0.1) z -= 0.08;
        break;
      case "lost-crests":
        if (z < 0) z -= 0.04 * Math.min(1, Math.abs(x) / 0.2);
        break;
      case "deep-sulci":
        if (z > 0) z -= 0.05 * Math.sin(x * 9);
        break;
      case "over-polish":
        x *= 0.96;
        z *= 0.9;
        break;
      default:
        break;
    }
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return mesh;
}

/** Camadas da evolução — opacidades sugeridas. */
export const SCULPTURE_LAYERS = [
  { id: "block" as const, label: "Bloco original", minBlend: 0 },
  { id: "planned" as const, label: "Contorno planejado", minBlend: 0.08 },
  { id: "rough" as const, label: "Volume grosseiro", minBlend: 0.28 },
  { id: "anatomic" as const, label: "Forma anatômica", minBlend: 0.5 },
  { id: "vestibular-detail" as const, label: "Detalhes vestibulares", minBlend: 0.72 },
  { id: "palatal-detail" as const, label: "Detalhes linguais", minBlend: 0.78 },
  { id: "finish" as const, label: "Acabamento final", minBlend: 0.92 },
];

void buildCrownProfile;
