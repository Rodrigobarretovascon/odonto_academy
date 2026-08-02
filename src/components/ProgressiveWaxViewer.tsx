import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { getTooth3DAssets } from "../lib/toothModel3d";
import { blendForAnimPhase, type AnimPhase } from "../data/sculpture-scripts";

export type ViewerCompareMode = "animate" | "before" | "after";
export type FaceView = "V" | "P" | "M" | "D" | "I";

export interface ProgressiveWaxViewerHandle {
  replay: () => void;
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setFaceView: (face: FaceView) => void;
}

interface ProgressiveWaxViewerProps {
  toothNumber: number;
  stepIndex: number;
  totalSteps: number;
  animPhase?: AnimPhase;
  /** Blend no início da etapa (estado herdado). */
  startBlend?: number;
  /** Blend ao fim da etapa. */
  endBlend?: number;
  compareMode?: ViewerCompareMode;
  replayKey?: number;
  showMarks?: boolean;
  showRemoval?: boolean;
  /** 1 = normal, 0.45 ≈ câmera lenta */
  playbackRate?: number;
  paused?: boolean;
}

function waxMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xb7d4d8, // cera odontológica azul-esverdeada fosca
    roughness: 0.78,
    metalness: 0.02,
  });
}

function toothWaxMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xc5dde0,
    roughness: 0.55,
    metalness: 0,
    transparent: true,
    opacity: 0.98,
  });
}

function metalMat(color = 0xb8bec6) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.62,
    roughness: 0.32,
  });
}

function makeLabel(text: string, color = "#2d5596") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 128);
  ctx.beginPath();
  ctx.arc(64, 64, 48, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "bold 52px Montserrat, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 66);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.28, 0.28, 1);
  return sprite;
}

function makeLecron(sharp = true) {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.026, 0.72, 12),
    metalMat(sharp ? 0xc5ccd4 : 0xaeb6bf),
  );
  handle.rotation.z = Math.PI / 2;
  const tip = new THREE.Mesh(
    sharp ? new THREE.ConeGeometry(0.028, 0.12, 12) : new THREE.SphereGeometry(0.03, 12, 12),
    metalMat(0x8f98a3),
  );
  tip.position.x = 0.4;
  if (sharp) tip.rotation.z = -Math.PI / 2;
  g.add(handle, tip);
  return g;
}

function makeSpatula() {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.55, 10), metalMat(0xd0d5db));
  shaft.rotation.z = Math.PI / 2;
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.01, 0.06),
    metalMat(0x9aa3ad),
  );
  blade.position.x = 0.34;
  g.add(shaft, blade);
  return g;
}

function makeRuler() {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.55, metalness: 0.05 }),
  );
  g.add(bar);
  return g;
}

/** Perfil proximal do central superior (Y = eixo longo, Z = V+/P−), pontos de controle. */
function centralProximalProfileYZ() {
  // Ordem: bossa V cervical → V médio → V/incisal → borda → fossa P → cíngulo → base cervical
  return [
    new THREE.Vector2(0.34, -0.46), // bossa vestibular (cervical)
    new THREE.Vector2(0.39, -0.18),
    new THREE.Vector2(0.37, 0.12),
    new THREE.Vector2(0.32, 0.38), // V próximo à incisal
    new THREE.Vector2(0.14, 0.52), // ângulo inciso-vestibular
    new THREE.Vector2(-0.02, 0.5), // borda incisal
    new THREE.Vector2(-0.16, 0.36), // início fossa lingual
    new THREE.Vector2(-0.24, 0.12),
    new THREE.Vector2(-0.26, -0.1), // fundo da fossa (médio)
    new THREE.Vector2(-0.3, -0.32), // cíngulo (projeção P)
    new THREE.Vector2(-0.18, -0.48),
    new THREE.Vector2(0.06, -0.54), // base cervical
    new THREE.Vector2(0.34, -0.46),
  ];
}

function smoothClosedYZ(points: THREE.Vector2[], segments = 96) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(0, p.y, p.x)),
    true,
    "catmullrom",
    0.35,
  );
  return curve.getPoints(segments);
}

function tubeFromPoints(points: THREE.Vector3[], radius: number, color: number, opacity = 1) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
  const geo = new THREE.TubeGeometry(curve, Math.max(24, points.length), radius, 8, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.08,
    transparent: opacity < 1,
    opacity,
  });
  return new THREE.Mesh(geo, mat);
}

function fillFromYZ(points: THREE.Vector2[], x: number, color: number, opacity: number) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].y);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  // Shape fica no plano XY; rotacionamos para YZ (proximal)
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.85,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.y = -Math.PI / 2;
  mesh.position.x = x;
  return mesh;
}

/** Guias didáticos do desenho proximal (mesial + distal). */
function buildProximalGuides() {
  const group = new THREE.Group();
  const profile = centralProximalProfileYZ();
  const halfW = 0.485;

  const makeFace = (x: number, mirrorZ: boolean) => {
    const face = new THREE.Group();
    const yz = profile.map((p) => new THREE.Vector2(mirrorZ ? -p.x : p.x, p.y));
    const pts = smoothClosedYZ(yz, 100).map((p) => new THREE.Vector3(x, p.y, p.z));

    // Preenchimento: forma a manter
    const keep = fillFromYZ(yz, x + (x > 0 ? 0.004 : -0.004), 0x2d5596, 0.2);
    face.add(keep);

    // Contorno grosso e legível
    face.add(tubeFromPoints(pts, 0.014, 0x1e3a6e, 1));

    // Segmento vestibular (destaque em ouro-rosado suave? usar azul claro)
    const vPts = pts.slice(0, Math.floor(pts.length * 0.38));
    if (vPts.length > 2) face.add(tubeFromPoints(vPts, 0.018, 0x3d7cc9, 1));

    // Segmento lingual (rosa didático)
    const pStart = Math.floor(pts.length * 0.42);
    const pEnd = Math.floor(pts.length * 0.86);
    const pPts = pts.slice(pStart, pEnd);
    if (pPts.length > 2) face.add(tubeFromPoints(pPts, 0.018, 0xc45a7a, 1));

    // Terços guia na face proximal
    const thirdMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    for (const y of [-0.18, 0.18]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.008, 0.78), thirdMat);
      line.position.set(x, y, 0);
      face.add(line);
    }

    // Labels V / P
    const labV = makeLabel("V", "#2d5596");
    labV.position.set(x + (x > 0 ? 0.12 : -0.12), 0.08, 0.48);
    labV.scale.set(0.22, 0.22, 1);
    const labP = makeLabel("P", "#a33d63");
    labP.position.set(x + (x > 0 ? 0.12 : -0.12), -0.05, -0.48);
    labP.scale.set(0.22, 0.22, 1);
    face.add(labV, labP);

    // Tag M ou D
    const side = makeLabel(x > 0 ? "D" : "M", "#475569");
    side.position.set(x + (x > 0 ? 0.16 : -0.16), 0.62, 0);
    side.scale.set(0.2, 0.2, 1);
    face.add(side);

    return { face, pts };
  };

  // No bloco: +X ≈ distal didático, −X ≈ mesial (vista proximal)
  const mesial = makeFace(-halfW, false);
  const distal = makeFace(halfW, false);
  mesial.face.name = "proximal-mesial";
  distal.face.name = "proximal-distal";
  group.add(mesial.face, distal.face);

  // Transferência paralela mesial → distal (linhas-guia)
  const transferMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const keyYs = [0.5, -0.5];
  const keyZs = [0.32, -0.28];
  keyYs.forEach((y, i) => {
    const z = keyZs[i];
    const bar = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.006, 0.006), transferMat);
    bar.position.set(0, y, z);
    group.add(bar);
  });

  // Pontos amostrados para o Lecron (mesial primeiro, depois distal)
  const pathPts = [...mesial.pts, ...distal.pts];

  group.userData.pathPts = pathPts;
  group.visible = false;
  return group;
}

const FACE_CAM: Record<FaceView, THREE.Vector3> = {
  V: new THREE.Vector3(0, 0.35, 2.35),
  P: new THREE.Vector3(0, 0.35, -2.35),
  M: new THREE.Vector3(-2.35, 0.25, 0),
  D: new THREE.Vector3(2.35, 0.25, 0),
  I: new THREE.Vector3(0.15, 2.45, 0.35),
};

function isCutting(phase: AnimPhase) {
  return [
    "rough-cut",
    "second-cut",
    "round",
    "vestibular",
    "lingual",
    "cingulum",
    "cusps",
    "occlusal",
    "root",
    "detail",
    "cervix",
  ].includes(phase);
}

function isMarking(phase: AnimPhase) {
  return ["thirds", "grid", "faces", "proximal-draw", "measure"].includes(phase);
}

/**
 * Viewer 3D progressivo e didático: órbita, zoom, vistas por face,
 * instrumento, marcações, volume a remover e morph contínuo.
 */
export const ProgressiveWaxViewer = forwardRef<
  ProgressiveWaxViewerHandle,
  ProgressiveWaxViewerProps
>(function ProgressiveWaxViewer(
  {
    toothNumber,
    stepIndex,
    totalSteps,
    animPhase = "rough-cut",
    startBlend,
    endBlend,
    compareMode = "animate",
    replayKey = 0,
    showMarks = true,
    showRemoval = true,
    playbackRate = 1,
    paused = false,
  },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    replay: () => void;
    resetCamera: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setFaceView: (face: FaceView) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    replay: () => apiRef.current?.replay(),
    resetCamera: () => apiRef.current?.resetCamera(),
    zoomIn: () => apiRef.current?.zoomIn(),
    zoomOut: () => apiRef.current?.zoomOut(),
    setFaceView: (face) => apiRef.current?.setFaceView(face),
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const assets = getTooth3DAssets(toothNumber);
    const width = container.clientWidth || 480;
    const height = Math.max(340, Math.min(540, Math.round(width * 0.74)));

    const startB =
      startBlend ??
      (stepIndex <= 0 ? 0 : blendForAnimPhase(animPhase) * (stepIndex / Math.max(totalSteps, 1)));
    const endB = endBlend ?? blendForAnimPhase(animPhase);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f7fb);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 80);
    const defaultCam = new THREE.Vector3(1.55, 0.55, 1.95);
    camera.position.copy(defaultCam);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.05;
    controls.maxDistance = 5.8;
    controls.target.set(0, 0.05, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xfff1dd, 1.1);
    key.position.set(2.4, 3.1, 2.2);
    const fill = new THREE.DirectionalLight(0xb8c9e8, 0.45);
    fill.position.set(-2.2, 1.1, -1.4);
    const rim = new THREE.DirectionalLight(0xffffff, 0.25);
    rim.position.set(0, -1.5, -2);
    scene.add(key, fill, rim);

    const stage = new THREE.Group();
    scene.add(stage);

    // Base / sombra suave
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 48),
      new THREE.MeshStandardMaterial({
        color: 0xe4ecf5,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.9,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.78;
    stage.add(ground);

    const block = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.85), waxMat());
    stage.add(block);

    // Região de trabalho (destaque)
    const workZone = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.42, 0.92),
      new THREE.MeshStandardMaterial({
        color: 0x2d5596,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    );
    workZone.visible = false;
    stage.add(workZone);

    // Volume a remover
    const ghost = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 1.42, 0.98),
      new THREE.MeshStandardMaterial({
        color: 0xc45a7a, // vermelho didático = remover
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        roughness: 0.55,
      }),
    );
    ghost.visible = false;
    stage.add(ghost);

    // Marcações — terços (anéis)
    const marks = new THREE.Group();
    const markMat = new THREE.LineBasicMaterial({ color: 0x2d5596, transparent: true, opacity: 0.95 });
    const ringYs = [-0.22, 0.22];
    for (const y of ringYs) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const rx = 0.48;
        const rz = 0.44;
        pts.push(new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz));
      }
      marks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), markMat.clone()));
    }
    marks.visible = false;
    stage.add(marks);

    // Contorno proximal didático (mesial + distal)
    const proximalGuides = buildProximalGuides();
    const proximalPath: THREE.Vector3[] = proximalGuides.userData.pathPts as THREE.Vector3[];
    stage.add(proximalGuides);

    // Labels das faces
    const labels = new THREE.Group();
    const labV = makeLabel("V");
    labV.position.set(0, 0.15, 0.62);
    const labP = makeLabel("P");
    labP.position.set(0, 0.15, -0.62);
    const labM = makeLabel("M");
    labM.position.set(-0.68, 0.15, 0);
    const labD = makeLabel("D");
    labD.position.set(0.68, 0.15, 0);
    labels.add(labV, labP, labM, labD);
    labels.visible = false;
    stage.add(labels);

    // Seta de movimento
    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0.15).normalize(),
      new THREE.Vector3(0.62, 0.5, 0.25),
      0.55,
      0xa33d63,
      0.12,
      0.08,
    );
    arrow.visible = false;
    stage.add(arrow);

    // Instrumentos
    const tool = makeLecron(true);
    tool.visible = false;
    stage.add(tool);

    const tray = new THREE.Group();
    const trayBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.05, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
    );
    trayBoard.position.set(0, -0.62, 0.95);
    const lec1 = makeLecron(true);
    lec1.position.set(-0.35, -0.52, 0.95);
    lec1.rotation.y = 0.2;
    const lec2 = makeLecron(false);
    lec2.position.set(0.05, -0.52, 0.95);
    lec2.rotation.y = -0.15;
    const spat = makeSpatula();
    spat.position.set(0.42, -0.52, 0.95);
    spat.rotation.y = 0.4;
    const ruler = makeRuler();
    ruler.position.set(0, -0.55, 1.22);
    ruler.rotation.y = 0.05;
    tray.add(trayBoard, lec1, lec2, spat, ruler);
    tray.visible = false;
    stage.add(tray);

    const toothGroup = new THREE.Group();
    toothGroup.visible = false;
    stage.add(toothGroup);

    const loader = new OBJLoader();
    let disposed = false;
    let frame = 0;

    const normalize = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      obj.position.sub(center);
      const scale = 1.35 / Math.max(size.x, size.y, size.z, 0.001);
      obj.scale.setScalar(scale);
      if (assets.mirrorX) obj.scale.x *= -1;
    };

    const mountTooth = (obj: THREE.Object3D) => {
      if (disposed) return;
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) child.material = toothWaxMat();
      });
      normalize(obj);
      toothGroup.clear();
      toothGroup.add(obj);
    };

    loader.load(
      assets.objUrl,
      (obj) => mountTooth(obj),
      undefined,
      () => {
        mountTooth(new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 8, 16), toothWaxMat()));
      },
    );

    // Câmera inicial por fase
    const applyPhaseCamera = () => {
      if (animPhase === "proximal-draw" || animPhase === "cervix") {
        camera.position.set(-2.25, 0.25, 0.2); // começa pela mesial
      } else if (animPhase === "cingulum" || animPhase === "lingual") {
        camera.position.set(0.35, 0.45, -2.15);
      } else if (animPhase === "root") {
        camera.position.set(1.4, -0.15, 1.7);
      } else if (animPhase === "occlusal" || animPhase === "cusps") {
        camera.position.set(0.2, 2.3, 0.5);
      } else if (animPhase === "instruments") {
        camera.position.set(1.35, 0.85, 2.15);
      } else {
        camera.position.copy(defaultCam);
      }
      controls.target.set(0, 0.05, 0);
      controls.update();
    };
    applyPhaseCamera();

    let animT = 0;
    let playing = compareMode === "animate";
    const animDuration = animPhase === "instruments" || isMarking(animPhase) ? 3.2 : 2.6;

    const applyCarve = (carve: number) => {
      // Bloco encolhe / arredonda progressivamente
      const sx = 1 - carve * 0.55;
      const sy = 1 - carve * 0.12;
      const sz = 1 - carve * 0.5;
      block.scale.set(sx, sy, sz);
      block.position.y = -carve * 0.04;
      // Chanfro visual nas arestas via rotação sutil
      block.rotation.y = carve > 0.35 ? Math.sin(carve * 2) * 0.02 : 0;

      const bm = block.material as THREE.MeshStandardMaterial;
      bm.transparent = carve > 0.58;
      bm.opacity = Math.max(0, 1 - Math.max(0, carve - 0.58) * 2.4);
      block.visible = carve < 0.92;

      const showTooth = carve > 0.08;
      toothGroup.visible = showTooth;
      if (showTooth) {
        toothGroup.scale.setScalar(0.45 + carve * 0.55);
        toothGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.opacity = Math.min(1, (carve - 0.08) * 1.5);
            child.material.transparent = child.material.opacity < 0.98;
          }
        });
      }
    };

    const placeToolOnPath = (t: number, carve: number) => {
      const u = t % 1;
      if (animPhase === "thirds") {
        const a = u * Math.PI * 2;
        const y = u < 0.5 ? 0.22 : -0.22;
        tool.position.set(Math.cos(a) * 0.55, y, Math.sin(a) * 0.5);
        tool.lookAt(0, y, 0);
        return;
      }
      if (animPhase === "proximal-draw") {
        const pts = proximalPath;
        if (pts.length > 1) {
          const idx = Math.min(pts.length - 1, Math.floor(u * (pts.length - 1)));
          const p = pts[idx];
          const outward = Math.sign(p.x) || 1;
          tool.position.set(p.x + outward * 0.1, p.y, p.z);
          tool.lookAt(0, p.y, p.z * 0.3);
        }
        return;
      }
      if (animPhase === "cingulum" || animPhase === "lingual") {
        const a = u * Math.PI;
        tool.position.set(Math.sin(a) * 0.35, 0.05 + Math.cos(a) * 0.2, -0.55);
        tool.lookAt(0, 0.1, -0.2);
        return;
      }
      if (animPhase === "root") {
        tool.position.set(0.45 * Math.cos(u * Math.PI * 2), -0.55, 0.45 * Math.sin(u * Math.PI * 2));
        tool.lookAt(0, -0.4, 0);
        return;
      }
      if (animPhase === "cervix") {
        const a = u * Math.PI * 2;
        tool.position.set(Math.cos(a) * 0.58, -0.05, Math.sin(a) * 0.52);
        tool.lookAt(0, -0.05, 0);
        return;
      }
      // Cortes gerais: trajetória diagonal de raspagem
      const radius = 0.72 - carve * 0.18;
      const a = u * Math.PI * 1.6 - 0.4;
      tool.position.set(Math.cos(a) * radius, 0.35 - u * 0.7, Math.sin(a) * radius * 0.75);
      tool.lookAt(0, 0, 0);
    };

    const configureHighlights = (carve: number, tNorm: number) => {
      const marking = isMarking(animPhase);
      const cutting = isCutting(animPhase);
      const instruments = animPhase === "instruments" || animPhase === "measure";

      tray.visible = instruments;
      labels.visible = instruments || animPhase === "faces" || animPhase === "thirds";

      // Terços / desenho
      marks.visible =
        showMarks && (animPhase === "thirds" || animPhase === "grid" || animPhase === "measure");
      marks.traverse((c) => {
        if (c instanceof THREE.Line && c.material instanceof THREE.LineBasicMaterial) {
          c.material.opacity = 0.55 + 0.4 * Math.sin(performance.now() * 0.005);
        }
      });

      const showProximal =
        showMarks &&
        (animPhase === "proximal-draw" || animPhase === "rough-cut" || animPhase === "second-cut");
      proximalGuides.visible = showProximal;
      if (showProximal) {
        proximalGuides.traverse((c) => {
          if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
            if (c.material.opacity > 0 && c.material.opacity < 0.5) {
              c.material.opacity = 0.16 + 0.08 * Math.sin(performance.now() * 0.0035);
            }
          }
        });
        const mesialG = proximalGuides.getObjectByName("proximal-mesial");
        const distalG = proximalGuides.getObjectByName("proximal-distal");
        if (mesialG && distalG) {
          mesialG.visible = true;
          distalG.visible =
            animPhase !== "proximal-draw" || tNorm > 0.45 || compareMode !== "animate" || !playing;
        }
      }

      // Work zone — oculta no desenho proximal (o próprio contorno já guia)
      workZone.visible = (marking || cutting) && animPhase !== "proximal-draw";
      if (workZone.visible) {
        if (animPhase === "thirds") {
          workZone.scale.set(1, 0.55, 1);
          workZone.position.set(0, tNorm < 0.5 ? 0.22 : -0.22, 0);
        } else if (animPhase === "cingulum" || animPhase === "lingual") {
          workZone.scale.set(0.9, 0.7, 0.4);
          workZone.position.set(0, 0.1, -0.35);
        } else if (animPhase === "root") {
          workZone.scale.set(0.85, 0.45, 0.85);
          workZone.position.set(0, -0.5, 0);
        } else if (animPhase === "cervix") {
          workZone.scale.set(1, 0.28, 1);
          workZone.position.set(0, -0.08, 0);
        } else if (animPhase === "detail" || animPhase === "vestibular") {
          workZone.scale.set(0.95, 0.75, 0.35);
          workZone.position.set(0, 0.15, 0.35);
        } else {
          workZone.scale.set(1.05, 1.05, 1.05);
          workZone.position.set(0, 0, 0);
        }
        const wm = workZone.material as THREE.MeshStandardMaterial;
        wm.opacity = 0.12 + 0.08 * Math.sin(performance.now() * 0.004);
      }

      // Ghost de remoção
      ghost.visible =
        showRemoval && cutting && compareMode !== "after" && carve < endB - 0.01;
      if (ghost.visible) {
        const g = Math.max(0.35, 1 - carve * 0.5);
        if (animPhase === "root") {
          ghost.scale.set(0.9 * g, 0.45, 0.9 * g);
          ghost.position.set(0, -0.55, 0);
        } else if (animPhase === "cingulum") {
          ghost.scale.set(0.7, 0.55, 0.35);
          ghost.position.set(0, 0.05, -0.35);
        } else if (animPhase === "second-cut") {
          ghost.scale.set(1.05 * g, 0.9, 1.05 * g);
          ghost.position.set(0.08, 0.1, 0.05);
        } else {
          ghost.scale.set(g * 1.05, g * 1.02, g * 1.05);
          ghost.position.set(0.05, 0.04, 0.04);
        }
        const gm = ghost.material as THREE.MeshStandardMaterial;
        gm.opacity = 0.22 + 0.1 * Math.sin(performance.now() * 0.003);
      }

      // Seta (não compete com o contorno proximal)
      arrow.visible = cutting || animPhase === "thirds";
      if (arrow.visible) {
        if (animPhase === "root") {
          arrow.setDirection(new THREE.Vector3(0, -1, 0));
          arrow.position.set(0.55, -0.2, 0.2);
        } else if (animPhase === "cingulum" || animPhase === "lingual") {
          arrow.setDirection(new THREE.Vector3(0, -0.4, -0.7).normalize());
          arrow.position.set(0.25, 0.35, -0.35);
        } else if (animPhase === "thirds") {
          arrow.setDirection(new THREE.Vector3(0, 0, 1));
          arrow.position.set(0.6, tNorm < 0.5 ? 0.22 : -0.22, 0);
        } else if (animPhase === "cervix") {
          arrow.setDirection(new THREE.Vector3(0, 0, 1));
          arrow.position.set(0.65, -0.05, 0);
        } else {
          arrow.setDirection(new THREE.Vector3(0.25, -0.9, 0.15).normalize());
          arrow.position.set(0.55, 0.45 - carve * 0.25, 0.2);
        }
      }

      // Instrumento em ação
      const showTool =
        !instruments &&
        animPhase !== "polish" &&
        (marking || cutting || animPhase === "faces");
      tool.visible = showTool;
      if (showTool) {
        if (compareMode === "animate" && playing) {
          placeToolOnPath(tNorm, carve);
        } else if (compareMode === "animate") {
          placeToolOnPath(0.72, carve);
        } else {
          placeToolOnPath(0.45, carve);
        }
      }

      // Pulse sutil nos labels
      if (labels.visible) {
        const s = 0.26 + 0.03 * Math.sin(performance.now() * 0.004);
        labels.children.forEach((c) => c.scale.set(s, s, 1));
      }
    };

    const currentCarveTarget = () => {
      if (compareMode === "before") return startB;
      if (compareMode === "after") return endB;
      const u = Math.min(1, animT / animDuration);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * u);
      // Em fases só de marcação, morph quase estável — o “motion” está no instrumento
      if (animPhase === "instruments") return startB + (endB - startB) * 0.15 * eased;
      if (isMarking(animPhase) && endB - startB < 0.08) {
        return startB + (endB - startB) * eased;
      }
      return startB + (endB - startB) * eased;
    };

    const setFaceView = (face: FaceView) => {
      const p = FACE_CAM[face];
      camera.position.copy(p);
      controls.target.set(0, face === "I" ? 0.2 : 0.05, 0);
      controls.update();
    };

    apiRef.current = {
      replay: () => {
        animT = 0;
        playing = true;
        applyPhaseCamera();
      },
      resetCamera: () => {
        applyPhaseCamera();
      },
      zoomIn: () => {
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).multiplyScalar(0.8);
        camera.position.copy(controls.target).add(dir);
        controls.update();
      },
      zoomOut: () => {
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).multiplyScalar(1.25);
        camera.position.copy(controls.target).add(dir);
        controls.update();
      },
      setFaceView,
    };

    animT = 0;
    playing = compareMode === "animate";

    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (playing && compareMode === "animate" && !paused) {
        animT += dt * Math.max(0.2, playbackRate);
        if (animT >= animDuration) {
          animT = animDuration;
          playing = false;
        }
      }
      const tNorm = Math.min(1, animT / animDuration);
      const carve = currentCarveTarget();
      applyCarve(carve);
      configureHighlights(carve, tNorm);

      // Demo: leve órbita automática só enquanto a animação roda (ajuda a ver 360°)
      if (playing && compareMode === "animate" && (animPhase === "instruments" || animPhase === "thirds")) {
        stage.rotation.y = tNorm * Math.PI * 0.65;
      } else if (!playing && animPhase === "instruments") {
        stage.rotation.y *= 0.92;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = Math.max(340, Math.min(540, Math.round(w * 0.74)));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
      apiRef.current = null;
    };
  }, [
    toothNumber,
    stepIndex,
    totalSteps,
    animPhase,
    startBlend,
    endBlend,
    compareMode,
    replayKey,
    showMarks,
    showRemoval,
    playbackRate,
    paused,
  ]);

  return <div className="prog-wax" ref={mountRef} aria-label="Modelo 3D progressivo da escultura" />;
});
