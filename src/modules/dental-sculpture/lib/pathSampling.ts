import * as THREE from "three";
import type { ToolPathPoint } from "../types/interaction";

export type SampledPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  tangent: THREE.Vector3;
};

function quatFromEulerArr(r: [number, number, number]) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2], "XYZ"));
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Interpola pose com Catmull-Rom (posição) + slerp (orientação). */
export function samplePathSmooth(path: ToolPathPoint[], t: number): SampledPose {
  if (path.length === 0) {
    return {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      tangent: new THREE.Vector3(1, 0, 0),
    };
  }
  if (path.length === 1) {
    return {
      position: new THREE.Vector3(...path[0].position),
      quaternion: quatFromEulerArr(path[0].rotation),
      tangent: new THREE.Vector3(1, 0, 0),
    };
  }

  const u = Math.min(1, Math.max(0, t));

  // Segmento por progress
  let i = 0;
  while (i < path.length - 1 && path[i + 1].progress < u) i++;
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  const span = Math.max(1e-5, b.progress - a.progress);
  const f = (u - a.progress) / span;

  // Catmull-Rom nos 4 vizinhos quando possível
  const p0 = path[Math.max(0, i - 1)];
  const p1 = a;
  const p2 = b;
  const p3 = path[Math.min(path.length - 1, i + 2)];
  const v0 = new THREE.Vector3(...p0.position);
  const v1 = new THREE.Vector3(...p1.position);
  const v2 = new THREE.Vector3(...p2.position);
  const v3 = new THREE.Vector3(...p3.position);

  const position =
    path.length >= 4
      ? new THREE.Vector3(
          catmullRom(v0.x, v1.x, v2.x, v3.x, f),
          catmullRom(v0.y, v1.y, v2.y, v3.y, f),
          catmullRom(v0.z, v1.z, v2.z, v3.z, f),
        )
      : v1.clone().lerp(v2, f);

  const qa = quatFromEulerArr(p1.rotation);
  const qb = quatFromEulerArr(p2.rotation);
  const quaternion = new THREE.Quaternion().slerpQuaternions(qa, qb, f);

  const tangent = v2.clone().sub(v1);
  if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0);
  else tangent.normalize();

  return { position, quaternion, tangent };
}

/** Comprimento poligonal de uma lista de pontos. */
export function pathLength(points: [number, number, number][]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    len += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  }
  return len;
}

/** Reamostra por comprimento de arco em N pontos (0..1). */
export function resampleByArcLength(
  points: [number, number, number][],
  n: number,
): [number, number, number][] {
  if (points.length === 0) return [];
  if (points.length === 1 || n <= 1) return [points[0]];
  const total = pathLength(points);
  if (total < 1e-8) return Array.from({ length: n }, () => points[0]);

  const out: [number, number, number][] = [];
  for (let k = 0; k < n; k++) {
    const target = (k / (n - 1)) * total;
    let acc = 0;
    let chosen: [number, number, number] = points[0];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const seg = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (acc + seg >= target) {
        const f = seg < 1e-8 ? 0 : (target - acc) / seg;
        chosen = [
          a[0] + (b[0] - a[0]) * f,
          a[1] + (b[1] - a[1]) * f,
          a[2] + (b[2] - a[2]) * f,
        ];
        break;
      }
      acc += seg;
      chosen = b;
    }
    out.push(chosen);
  }
  return out;
}

export function idealPositions(ideal: ToolPathPoint[]): [number, number, number][] {
  return ideal.map((p) => p.position);
}

/** Valida monotonia de progress em [0,1]. */
export function validatePathProgress(path: ToolPathPoint[]): string[] {
  const errs: string[] = [];
  if (path.length < 2) {
    errs.push("path precisa de ≥2 pontos");
    return errs;
  }
  if (path[0].progress > 0.02) errs.push("progress inicial deve ser ~0");
  if (Math.abs(path[path.length - 1].progress - 1) > 0.02) errs.push("progress final deve ser ~1");
  for (let i = 1; i < path.length; i++) {
    if (path[i].progress + 1e-6 < path[i - 1].progress) {
      errs.push(`progress não monótono em i=${i}`);
      break;
    }
  }
  return errs;
}

/** Aproxima/afasta a ponta no início e fim (easing de abordagem). */
export function approachFactor(localT: number, kind: "cut" | "scrape" | "mark" | "brush" | "default") {
  const ease = (x: number) => x * x * (3 - 2 * x);
  if (kind === "cut") {
    if (localT < 0.12) return ease(localT / 0.12);
    if (localT > 0.88) return ease((1 - localT) / 0.12);
    return 1;
  }
  if (kind === "mark") {
    if (localT < 0.08) return ease(localT / 0.08) * 0.85;
    if (localT > 0.92) return ease((1 - localT) / 0.08) * 0.85;
    return 0.9;
  }
  if (kind === "brush") {
    return 0.75 + 0.25 * Math.sin(localT * Math.PI);
  }
  if (localT < 0.1) return ease(localT / 0.1);
  if (localT > 0.9) return ease((1 - localT) / 0.1);
  return 1;
}
