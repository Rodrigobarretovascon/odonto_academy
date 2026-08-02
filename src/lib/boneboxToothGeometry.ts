/**
 * Formatos anatômicos de dente (estilo BoneBox):
 * coroa esmalte brilhante + raiz(s) cemento fosco.
 */
import * as THREE from "three";

export type ToothKind = "central" | "lateral" | "canine" | "premolar" | "molar";

export function kindFromFdi(fdi: number): ToothKind {
  const n = fdi % 10;
  if (n === 1) return "central";
  if (n === 2) return "lateral";
  if (n === 3) return "canine";
  if (n === 4 || n === 5) return "premolar";
  return "molar";
}

export function isUpperFdi(fdi: number): boolean {
  const q = Math.floor(fdi / 10);
  return q === 1 || q === 2;
}

/** Proporções clínicas aproximadas (unidades da cena). */
function crownSize(kind: ToothKind): { w: number; h: number; d: number } {
  switch (kind) {
    case "central":
      return { w: 0.26, h: 0.38, d: 0.2 };
    case "lateral":
      return { w: 0.2, h: 0.34, d: 0.17 };
    case "canine":
      return { w: 0.22, h: 0.4, d: 0.22 };
    case "premolar":
      return { w: 0.22, h: 0.28, d: 0.26 };
    default:
      return { w: 0.3, h: 0.26, d: 0.32 };
  }
}

function rootLength(kind: ToothKind, fdi: number): number {
  const n = fdi % 10;
  if (kind === "canine") return 0.52;
  if (kind === "central") return 0.42;
  if (kind === "lateral") return 0.4;
  if (kind === "premolar") return n === 4 && isUpperFdi(fdi) ? 0.4 : 0.38;
  if (n === 6) return 0.4;
  if (n === 8) return 0.32;
  return 0.36;
}

export function enamelMaterial(selected = false): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: selected ? "#fff6e6" : "#f5f1ea",
    roughness: 0.16,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    transmission: 0.14,
    thickness: 0.5,
    ior: 1.45,
    sheen: 0.2,
    sheenColor: new THREE.Color("#fff8f0"),
    sheenRoughness: 0.35,
    emissive: selected ? new THREE.Color("#3a2a10") : new THREE.Color("#000000"),
    emissiveIntensity: selected ? 0.16 : 0,
  });
}

export function rootMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: "#c9a882",
    roughness: 0.78,
    metalness: 0.02,
  });
}

function deformCrown(
  geo: THREE.BufferGeometry,
  kind: ToothKind,
  fdi: number,
  upper: boolean,
) {
  const { w, h, d } = crownSize(kind);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const n = fdi % 10;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let x = v.x;
    let y = v.y;
    let z = v.z;
    const nx = x / (w * 0.5);
    const ny = y / (h * 0.5);
    const nz = z / (d * 0.5);

    // Arredonda contorno MD/VL
    const radial = Math.hypot(nx, nz);
    if (radial > 0.45) {
      const t = Math.min(1, (radial - 0.45) / 0.6);
      const s = 1 - t * 0.28;
      x *= s;
      z *= s;
    }

    // Colo cervical mais estreito
    if (ny < -0.35) {
      const t = (-0.35 - ny) / 0.65;
      x *= 1 - t * 0.32;
      z *= 1 - t * 0.28;
    }

    if (kind === "central" || kind === "lateral") {
      // Face vestibular convexa + borda incisal fina
      if (z > 0) {
        const boss = 0.035 * Math.exp(-((ny + 0.15) / 0.55) ** 2) * (1 - Math.abs(nx) * 0.4);
        z += boss;
        // lóbulos / mamelões
        z -= 0.012 * Math.sin(nx * Math.PI * 1.5) * Math.max(0, 0.9 - Math.abs(ny));
      } else {
        // cíngulo + fossa lingual
        if (ny < -0.05) {
          z -= 0.055 * Math.exp(-((ny + 0.25) / 0.28) ** 2) * (1 - Math.abs(nx) * 0.7);
        } else {
          z += 0.04 * Math.sin(((ny + 0.05) / 0.7) * Math.PI) * (1 - Math.abs(nx));
        }
      }
      if (ny > 0.35) {
        z *= 0.55 + 0.1 * (1 - Math.abs(nx));
        y += Math.sin(nx * Math.PI * 1.5) * 0.01; // mamelões
      }
      // ângulos: mesial mais agudo, distal mais arredondado
      if (ny > 0.2 && Math.abs(nx) > 0.5) {
        const edge = (Math.abs(nx) - 0.5) / 0.5;
        y -= edge * (nx > 0 ? 0.08 : 0.05);
      }
      if (kind === "lateral") {
        x *= 0.92;
        if (ny > 0.3) y -= 0.02; // borda mais arredondada
      }
    }

    if (kind === "canine") {
      // cúspide única
      if (ny > 0) {
        const tip = ny * ny;
        x *= 1 - tip * 0.62;
        z *= 1 - tip * 0.38;
        y += tip * 0.07;
      }
      if (z > 0) {
        z += 0.03 * (1 - Math.abs(nx)) * Math.max(0, 1 - Math.abs(ny));
      } else if (ny < 0) {
        z -= 0.04 * Math.exp(-((ny + 0.2) / 0.3) ** 2);
      }
    }

    if (kind === "premolar") {
      // duas cúspides (V e L)
      if (ny > 0.05) {
        const cuspV = Math.exp(-((nz - 0.35) / 0.45) ** 2) * Math.exp(-(nx / 0.7) ** 2);
        const cuspL = Math.exp(-((nz + 0.35) / 0.45) ** 2) * Math.exp(-(nx / 0.7) ** 2);
        y += (cuspV * 0.055 + cuspL * (n === 4 ? 0.04 : 0.048));
        // sulco central
        if (Math.abs(nz) < 0.25) y -= 0.022 * (1 - Math.abs(nz) / 0.25);
      }
      if (ny < -0.2) {
        x *= 0.9;
        z *= 0.92;
      }
    }

    if (kind === "molar") {
      // 4 cúspides + sulcos
      if (ny > 0) {
        const cx = nx > 0 ? 0.4 : -0.4;
        const cz = nz > 0 ? 0.35 : -0.35;
        const cusp = Math.exp(-((nx - cx) / 0.55) ** 2) * Math.exp(-((nz - cz) / 0.5) ** 2);
        y += cusp * (n === 8 ? 0.035 : 0.05);
        if (Math.abs(nx) < 0.2) y -= 0.02;
        if (Math.abs(nz) < 0.18) y -= 0.015;
      }
      // 1º molar superior: cúspide de Carabelli suave
      if (n === 6 && isUpperFdi(fdi) && nz < -0.2 && nx < -0.15 && ny > 0) {
        y += 0.018;
        z -= 0.01;
      }
      if (ny < -0.25) {
        x *= 0.88;
        z *= 0.9;
      }
    }

    pos.setXYZ(i, x, upper ? y : -y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function makeRootCone(
  length: number,
  radiusTop: number,
  radiusTip: number,
  radialSegs = 14,
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTip, radiusTop, length, radialSegs, 6, false);
  // apex com leve curva
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = (v.y + length * 0.5) / length; // 0 tip → 1 cervix
    const bulge = 1 + Math.sin(t * Math.PI) * 0.04;
    v.x *= bulge;
    v.z *= bulge;
    // leve achatamento MD em alguns pontos feito no caller via scale
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export type BuiltTooth = {
  group: THREE.Group;
  pickMesh: THREE.Mesh;
  enamelMats: THREE.MeshPhysicalMaterial[];
  crownHeight: number;
};

/**
 * Monta um dente completo (coroa + raiz/raízes) no estilo BoneBox.
 * Eixo Y: cervical em 0, coroa +Y (superior) / espelhado se lower.
 */
export function buildBoneboxTooth(fdi: number, selected = false): BuiltTooth {
  const kind = kindFromFdi(fdi);
  const upper = isUpperFdi(fdi);
  const n = fdi % 10;
  const { w, h, d } = crownSize(kind);
  const group = new THREE.Group();
  group.name = `tooth-${fdi}`;

  const enamel = enamelMaterial(selected);
  const cement = rootMaterial();
  const enamelMats = [enamel];

  // —— Coroa ——
  const crownGeo = new THREE.BoxGeometry(w, h, d, 10, 14, 8);
  deformCrown(crownGeo, kind, fdi, true); // always build "upper" local, flip group later
  const crown = new THREE.Mesh(crownGeo, enamel);
  crown.position.y = h * 0.5;
  crown.name = `crown-${fdi}`;
  group.add(crown);

  // —— Raiz(es) ——
  const len = rootLength(kind, fdi);
  const roots: THREE.Mesh[] = [];

  const addRoot = (ox: number, oz: number, lenMul: number, rx: number, rz: number, tiltX = 0, tiltZ = 0) => {
    const geo = makeRootCone(len * lenMul, rx, rx * 0.18);
    const mesh = new THREE.Mesh(geo, cement);
    mesh.position.set(ox, -len * lenMul * 0.5, oz);
    mesh.scale.set(1, 1, rz / rx);
    mesh.rotation.x = tiltX;
    mesh.rotation.z = tiltZ;
    mesh.name = `root-${fdi}`;
    group.add(mesh);
    roots.push(mesh);
  };

  if (kind === "central" || kind === "lateral" || kind === "canine") {
    addRoot(0, 0.01, 1, w * 0.28, d * 0.26, 0.04, 0);
  } else if (kind === "premolar") {
    if (n === 4 && upper) {
      // 1º pré-molar superior: frequentemente 2 raízes
      addRoot(0, 0.06, 0.95, w * 0.2, d * 0.18, -0.08, 0);
      addRoot(0, -0.07, 0.9, w * 0.18, d * 0.16, 0.1, 0);
    } else {
      addRoot(0, 0, 1, w * 0.24, d * 0.22, 0.05, 0);
    }
  } else {
    // molares
    if (upper) {
      // 3 raízes: 2 vestibulares + 1 palatina
      addRoot(-0.06, 0.07, 0.92, w * 0.16, d * 0.14, -0.1, 0.08);
      addRoot(0.06, 0.07, 0.9, w * 0.16, d * 0.14, -0.1, -0.08);
      addRoot(0, -0.09, 1, w * 0.18, d * 0.16, 0.12, 0);
    } else {
      // 2 raízes mesial/distal
      addRoot(-0.07, 0.02, 1, w * 0.17, d * 0.2, 0.05, 0.1);
      addRoot(0.07, 0.02, 0.95, w * 0.16, d * 0.18, 0.05, -0.08);
    }
    if (n === 8) {
      // 3º molar: raízes mais curtas/fundidas
      roots.forEach((r) => {
        r.scale.y *= 0.75;
        r.position.y *= 0.75;
      });
    }
  }

  if (!upper) {
    group.scale.y = -1;
  }

  // Mesh de picking = coroa (raycast confiável)
  return {
    group,
    pickMesh: crown,
    enamelMats,
    crownHeight: h,
  };
}

export function setToothSelected(tooth: BuiltTooth, selected: boolean) {
  for (const mat of tooth.enamelMats) {
    mat.color.set(selected ? "#fff6e6" : "#f5f1ea");
    mat.emissive.set(selected ? "#3a2a10" : "#000000");
    mat.emissiveIntensity = selected ? 0.16 : 0;
    mat.needsUpdate = true;
  }
}
