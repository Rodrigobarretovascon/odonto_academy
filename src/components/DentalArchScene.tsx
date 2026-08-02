/**
 * Arcada 3D estilo BoneBox — dentes com formato anatômico (coroa + raiz).
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  buildBoneboxTooth,
  kindFromFdi,
  setToothSelected,
  type BuiltTooth,
} from "../lib/boneboxToothGeometry";

const BG = 0x1c1c1e;

const FDI_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const FDI_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export type ArchToothInfo = {
  fdi: number;
  name: string;
  arch: "superior" | "inferior";
};

type ToothKind = "central" | "lateral" | "canine" | "premolar" | "molar";

type Props = {
  onSelectTooth?: (tooth: ArchToothInfo | null) => void;
  selectedFdi?: number | null;
};

function toothName(fdi: number): string {
  const kind = kindFromFdi(fdi);
  const labels: Record<ToothKind, string> = {
    central: "Incisivo central",
    lateral: "Incisivo lateral",
    canine: "Canino",
    premolar: fdi % 10 === 4 ? "1º pré-molar" : "2º pré-molar",
    molar: fdi % 10 === 6 ? "1º molar" : fdi % 10 === 7 ? "2º molar" : "3º molar",
  };
  const quadrant = Math.floor(fdi / 10);
  const side = quadrant === 1 || quadrant === 4 ? "direito" : "esquerdo";
  const arch = quadrant <= 2 ? "superior" : "inferior";
  return `${labels[kind]} ${arch} ${side}`;
}

function archPoint(idx: number, total: number, radius: number, zScale: number) {
  const t = idx / (total - 1);
  const angle = Math.PI - t * Math.PI;
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius * zScale,
    angle,
  };
}

function buildJawBone(upper: boolean, radius: number): THREE.Mesh {
  const shape = new THREE.Shape();
  const yOuter = upper ? 0.72 : -0.72;
  const yInner = upper ? 0.05 : -0.05;
  shape.moveTo(-radius * 1.08, yInner);
  shape.bezierCurveTo(-radius * 1.2, yOuter * 0.35, -radius * 0.55, yOuter, 0, yOuter);
  shape.bezierCurveTo(radius * 0.55, yOuter, radius * 1.2, yOuter * 0.35, radius * 1.08, yInner);
  shape.lineTo(radius * 0.9, yInner + (upper ? 0.02 : -0.02));
  shape.bezierCurveTo(
    radius * 0.35,
    yInner + (upper ? 0.12 : -0.12),
    -radius * 0.35,
    yInner + (upper ? 0.12 : -0.12),
    -radius * 0.9,
    yInner + (upper ? 0.02 : -0.02),
  );
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.55);

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: "#c4a574",
      roughness: 0.82,
      metalness: 0.02,
    }),
  );
  mesh.position.set(0, upper ? 0.28 : -0.32, -0.08);
  mesh.name = upper ? "bone-upper" : "bone-lower";
  return mesh;
}

function buildGumRibbon(
  points: { x: number; z: number }[],
  y: number,
  upper: boolean,
): THREE.Group {
  const group = new THREE.Group();
  const soft = new THREE.MeshStandardMaterial({
    color: "#d47884",
    roughness: 0.48,
    metalness: 0.02,
  });
  const deep = new THREE.MeshStandardMaterial({
    color: "#b85a68",
    roughness: 0.55,
    metalness: 0.02,
  });

  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    false,
    "centripetal",
  );
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.13, 12, false), deep);
  tube.position.y = y;
  tube.scale.y = 0.7;
  group.add(tube);

  points.forEach((p, i) => {
    const festoon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), soft);
    festoon.scale.set(1.15, 0.55, 0.9);
    festoon.position.set(p.x, y + (upper ? -0.02 : 0.02), p.z + 0.03);
    group.add(festoon);

    if (i < points.length - 1) {
      const n = points[i + 1];
      const pap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), soft);
      pap.scale.set(0.65, 1.15, 0.5);
      pap.position.set((p.x + n.x) * 0.5, y, (p.z + n.z) * 0.5 + 0.05);
      group.add(pap);
    }
  });

  return group;
}

function buildArch(
  upper: boolean,
  toothMap: Map<number, BuiltTooth>,
): THREE.Group {
  const group = new THREE.Group();
  const fdis = upper ? FDI_UPPER : FDI_LOWER;
  const radius = upper ? 1.48 : 1.4;
  const zScale = 0.4;
  const yGum = upper ? 0.18 : -0.16;

  group.add(buildJawBone(upper, radius * 0.98));

  const pts = fdis.map((_, idx) => archPoint(idx, fdis.length, radius, zScale));
  group.add(buildGumRibbon(pts.map((p) => ({ x: p.x, z: p.z })), yGum, upper));

  fdis.forEach((fdi, idx) => {
    const kind = kindFromFdi(fdi);
    const built = buildBoneboxTooth(fdi, false);
    const info: ArchToothInfo = {
      fdi,
      name: toothName(fdi),
      arch: upper ? "superior" : "inferior",
    };
    built.group.userData = info;
    built.pickMesh.userData = info;
    // raiz fica no osso; CEJ na linha da gengiva
    built.group.position.set(
      pts[idx].x,
      yGum,
      pts[idx].z + (upper ? 0.03 : -0.02),
    );
    built.group.rotation.y = pts[idx].angle - Math.PI / 2;
    if (Math.abs(idx - 7.5) < 3) {
      built.group.rotation.x = upper ? -0.05 : 0.05;
    }
    if (kind === "canine") {
      built.group.position.y += upper ? 0.02 : -0.02;
    }
    group.add(built.group);
    toothMap.set(fdi, built);
  });

  return group;
}

export function DentalArchScene({ onSelectTooth, selectedFdi = null }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedFdi);
  const teethRef = useRef(new Map<number, BuiltTooth>());
  const onSelectRef = useRef(onSelectTooth);
  onSelectRef.current = onSelectTooth;
  selectedRef.current = selectedFdi;

  useEffect(() => {
    teethRef.current.forEach((tooth, fdi) => {
      setToothSelected(tooth, fdi === selectedFdi);
    });
  }, [selectedFdi]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    camera.position.set(0, 0.35, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    scene.add(new THREE.HemisphereLight(0x6a6a72, 0x1a1208, 0.35));
    const key = new THREE.DirectionalLight(0xfff4ea, 1.35);
    key.position.set(1.2, 2.4, 3.8);
    const fill = new THREE.DirectionalLight(0xa8b8c8, 0.45);
    fill.position.set(-2.8, 0.8, 2);
    const rim = new THREE.DirectionalLight(0xffe0c8, 0.4);
    rim.position.set(0, 1.5, -3);
    scene.add(key, fill, rim);

    const root = new THREE.Group();
    const teeth = new Map<number, BuiltTooth>();
    root.add(buildArch(true, teeth));
    root.add(buildArch(false, teeth));
    teethRef.current = teeth;
    scene.add(root);

    if (selectedRef.current != null) {
      const t = teeth.get(selectedRef.current);
      if (t) setToothSelected(t, true);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.2;
    controls.maxDistance = 8;
    controls.target.set(0, 0.05, 0);
    controls.update();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const pickables = [...teeth.values()].map((t) => t.pickMesh);

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length > 0) {
        onSelectRef.current?.(hits[0].object.userData as ArchToothInfo);
      } else {
        onSelectRef.current?.(null);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let frame = 0;
    let disposed = false;
    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      });
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="anatomy-arch-3d" ref={containerRef} />;
}
