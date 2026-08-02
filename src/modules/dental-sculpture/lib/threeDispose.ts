import * as THREE from "three";

/** Descarta geometrias, materiais e texturas de uma hierarquia. */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
      obj.geometry?.dispose?.();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (!m) continue;
        for (const key of Object.keys(m) as (keyof THREE.Material)[]) {
          const v = m[key] as unknown;
          if (v && typeof v === "object" && "isTexture" in (v as object)) {
            (v as THREE.Texture).dispose();
          }
        }
        m.dispose?.();
      }
    }
    if (obj instanceof THREE.Sprite && obj.material) {
      obj.material.map?.dispose();
      obj.material.dispose();
    }
  });
}

/** Raycast da ponta para a superfície do dente; retorna ponto + normal. */
export function projectTipToSurface(
  raycaster: THREE.Raycaster,
  tooth: THREE.Object3D,
  tipHint: THREE.Vector3,
  standoff = 0.018,
): { point: THREE.Vector3; normal: THREE.Vector3; distance: number } | null {
  const dirIn = tipHint.clone().normalize().negate();
  if (dirIn.lengthSq() < 1e-8) dirIn.set(0, 0, -1);
  const origin = tipHint.clone().normalize().multiplyScalar(2.2);
  if (origin.lengthSq() < 1e-6) origin.set(0, 0, 2.2);
  raycaster.set(origin, dirIn);
  const hits = raycaster.intersectObject(tooth, true);
  if (!hits.length) {
    // fallback: esfera aproximada
    const r = 0.48;
    const n = tipHint.clone().normalize();
    const point = n.multiplyScalar(r);
    return { point, normal: n.clone(), distance: tipHint.distanceTo(point) };
  }
  const hit = hits[0];
  const normal = hit.face
    ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
    : tipHint.clone().normalize();
  const point = hit.point.clone().addScaledVector(normal, standoff);
  return { point, normal, distance: tipHint.distanceTo(point) };
}
