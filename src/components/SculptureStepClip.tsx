import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { blendForAnimPhase, type AnimPhase } from "../data/sculpture-scripts";
import {
  teachingForAnyTooth,
} from "../data/phase-teaching";
import type { TeachingView } from "../data/tooth-11-phases";
import { createProceduralIncisor } from "../modules/dental-sculpture/lib/proceduralIncisor";
import {
  LAB,
  highlightActiveTip,
  instrumentForPhase,
  makeActiveInstrument,
  makeInstrumentTray,
  makeWaxBlock,
} from "./waxLabProps";

interface Props {
  toothNumber: number;
  stepId: number;
  stepTitle: string;
  animPhase: AnimPhase;
  startBlend: number;
  endBlend: number;
}

const VIEWS: { id: TeachingView; label: string }[] = [
  { id: "V", label: "V" },
  { id: "L", label: "L" },
  { id: "M", label: "M" },
  { id: "D", label: "D" },
  { id: "I", label: "I" },
  { id: "obliqua", label: "Oblíqua" },
];

const REMOVE = 0xc45a5a;
const PRESERVE = 0x3d9b6e;

const INSTRUMENT_LABEL: Record<string, string> = {
  ruler: "Régua",
  cutter: "Estilete (cutter vermelho)",
  lecron: "Lecron",
  brush: "Escova",
  sandpaper: "Meia-fina",
};

function makeLabel(text: string, color = "#1e3a6e") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(4, 8, 120, 48);
  ctx.fillStyle = color;
  ctx.font = "bold 28px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, 64, 42);
  const spr = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }),
  );
  spr.scale.set(0.28, 0.14, 1);
  return spr;
}

function makeArrow(dir: THREE.Vector3, color: number) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8),
    new THREE.MeshBasicMaterial({ color }),
  );
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.1, 10),
    new THREE.MeshBasicMaterial({ color }),
  );
  head.position.y = 0.22;
  g.add(shaft, head);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return g;
}

function cameraForView(view: TeachingView, mirror: boolean): THREE.Vector3 {
  const m = mirror ? -1 : 1;
  switch (view) {
    case "V":
      return new THREE.Vector3(0, 0.35, 2.35);
    case "L":
      return new THREE.Vector3(0, 0.35, -2.35);
    case "M":
      return new THREE.Vector3(-2.2 * m, 0.25, 0.15);
    case "D":
      return new THREE.Vector3(2.2 * m, 0.25, 0.15);
    case "I":
      return new THREE.Vector3(0.05, 2.6, 0.05);
    case "obliqua":
    default:
      return new THREE.Vector3(0.55 * m, 2.15, 1.45);
  }
}

/**
 * Clipe 3D por etapa — bloco e instrumentais espelhados no vídeo de bancada.
 * 11 = demonstração; 21 = espelho contralateral.
 */
export function SculptureStepClip({
  toothNumber,
  stepId,
  stepTitle,
  animPhase,
  startBlend,
  endBlend,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const camApi = useRef<{ setView: (v: TeachingView) => void } | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const teaching = teachingForAnyTooth(toothNumber, stepId);
  const [view, setView] = useState<TeachingView>(teaching?.defaultView ?? "obliqua");
  const activeKind = instrumentForPhase(animPhase, stepId);
  void stepTitle;

  useEffect(() => {
    setView(teaching?.defaultView ?? "obliqua");
  }, [stepId, toothNumber, teaching?.defaultView]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const mirror = toothNumber === 21;
    const w = el.clientWidth || 520;
    const h = Math.max(300, Math.min(460, Math.round(w * 0.68)));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(LAB.mat);

    const camera = new THREE.PerspectiveCamera(36, w / h, 0.01, 80);
    camera.position.copy(cameraForView(view, mirror));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.05, 0);
    controls.minDistance = 1.2;
    controls.maxDistance = 5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xfff6e8, 1.0);
    key.position.set(2, 4.5, 2.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd8ecf8, 0.4);
    fill.position.set(-2, 2, -1);
    scene.add(fill);

    const stage = new THREE.Group();
    if (mirror) stage.scale.x = -1;
    scene.add(stage);

    // Tapete azul-claro (vídeo)
    const matMesh = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshStandardMaterial({ color: LAB.mat, roughness: 0.96, metalness: 0 }),
    );
    matMesh.rotation.x = -Math.PI / 2;
    matMesh.position.y = -0.78;
    stage.add(matMesh);

    // Aparos de cera
    for (let i = 0; i < 22; i++) {
      const flake = new THREE.Mesh(
        new THREE.BoxGeometry(0.035 + Math.random() * 0.07, 0.007, 0.018 + Math.random() * 0.05),
        new THREE.MeshStandardMaterial({ color: LAB.waxShade, roughness: 0.95 }),
      );
      const a = Math.random() * Math.PI * 2;
      const r = 0.28 + Math.random() * 0.95;
      flake.position.set(Math.cos(a) * r, -0.76, Math.sin(a) * r);
      flake.rotation.set(0, Math.random() * 3, Math.random() * 0.5);
      stage.add(flake);
    }

    // Instrumentos em repouso (cutter, escova, Lecron, régua…)
    stage.add(makeInstrumentTray(activeKind));

    // Bloquinho estreito/alongado como no vídeo
    const block = makeWaxBlock();
    stage.add(block);

    const tooth = createProceduralIncisor(1);
    const tm = tooth.material as THREE.MeshStandardMaterial;
    tm.color.setHex(LAB.wax);
    tm.roughness = 0.82;
    tooth.scale.setScalar(0.52);
    tooth.visible = false;
    stage.add(tooth);

    const removeGhost = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.2, 0.62),
      new THREE.MeshStandardMaterial({
        color: REMOVE,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    stage.add(removeGhost);

    const preserveGhost = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.45, 0.35),
      new THREE.MeshStandardMaterial({
        color: PRESERVE,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    stage.add(preserveGhost);

    const tool = makeActiveInstrument(activeKind);
    highlightActiveTip(tool, true);
    stage.add(tool);

    const tipBadge = makeLabel("PONTA", "#b45309");
    tipBadge.scale.set(0.22, 0.11, 1);
    stage.add(tipBadge);

    const labels = new THREE.Group();
    stage.add(labels);
    if (animPhase === "faces" || animPhase === "measure" || stepId <= 3) {
      const map: [string, number, number, number][] = [
        ["V", 0, 0.25, 0.42],
        ["L", 0, 0.2, -0.42],
        ["M", -0.42, 0.2, 0],
        ["D", 0.42, 0.2, 0],
      ];
      for (const [t, x, y, z] of map) {
        const s = makeLabel(t);
        s.position.set(x, y, z);
        labels.add(s);
      }
    }

    if (animPhase === "thirds" || animPhase === "measure" || stepId === 1) {
      for (const y of [-0.25, 0.25]) {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * 0.32, y, Math.sin(a) * 0.28));
        }
        labels.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: 0x1e4a7a }),
          ),
        );
      }
    }

    const arrows = new THREE.Group();
    stage.add(arrows);
    if (["rough-cut", "second-cut", "round", "lingual", "cingulum", "vestibular"].includes(animPhase)) {
      const a1 = makeArrow(new THREE.Vector3(0, -1, 0.15), REMOVE);
      a1.position.set(0.48, 0.3, 0.28);
      arrows.add(a1);
    }

    let frame = 0;
    let tProg = 0;
    let playing = true;
    const duration = 10;
    const pausedRef = { current: false };
    const removeAmt = teaching?.removeOverlay ?? 0.35;
    const preserveAmt = teaching?.preserveOverlay ?? 0.25;

    const apply = (u: number) => {
      const carve = startBlend + (endBlend - startBlend) * u;

      // Base permanece mais “bloco”; coroa afila (como no vídeo)
      const sx = 1 - carve * 0.42;
      const sy = 1 - carve * 0.08;
      const sz = 1 - carve * 0.38;
      block.scale.set(sx, sy, sz);
      block.position.y = -carve * 0.03;
      const bm = block.material as THREE.MeshStandardMaterial;
      bm.transparent = carve > 0.55;
      bm.opacity = Math.max(0, 1 - Math.max(0, carve - 0.55) * 2.4);
      block.visible = carve < 0.93;

      const showTooth = carve > 0.12;
      tooth.visible = showTooth;
      if (showTooth) {
        tooth.scale.setScalar(0.48 + carve * 0.5);
        tm.color.setHex(LAB.wax);
        tm.roughness = 0.82;
        tm.opacity = Math.min(1, (carve - 0.12) * 1.5);
        tm.transparent = tm.opacity < 0.98;
      }

      // Movimento do instrumento ativo (estilo bancada)
      if (activeKind === "ruler") {
        tool.position.set(0, 0.55 - u * 0.15, 0.35);
        tool.rotation.set(0.15, 0, 0.05);
      } else if (activeKind === "cutter") {
        tool.position.set(0.42, 0.4 - u * 0.55, 0.32);
        tool.rotation.set(0.35, 0.55, 0.85);
      } else if (activeKind === "brush") {
        tool.position.set(0.35, 0.25, 0.4 - u * 0.2);
        tool.rotation.set(0.4, 0.3, 0.2);
      } else if (activeKind === "sandpaper") {
        tool.position.set(0.1, 0.2 + Math.sin(u * Math.PI * 4) * 0.05, 0.35);
        tool.rotation.set(-Math.PI / 2.2, 0, u * 0.4);
      } else if (animPhase === "proximal-draw") {
        tool.position.set(-0.42, 0.45 - u * 0.8, 0.1);
        tool.rotation.set(0.35, -1.05, 0.2);
      } else if (animPhase === "lingual" || animPhase === "cingulum") {
        tool.position.set(Math.sin(u * Math.PI * 2) * 0.08, 0.32 - u * 0.4, -0.4);
        tool.rotation.set(0.95, 0.1, 0.1);
      } else if (animPhase === "cervix") {
        const a = u * Math.PI * 2;
        tool.position.set(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.34);
        tool.lookAt(0, 0, 0);
      } else {
        tool.position.set(0.4 - u * 0.1, 0.45 - u * 0.7, 0.28);
        tool.rotation.set(0.3, 0.9, 0.25);
      }

      // Badge na ponta ativa
      const tip = tool.userData.activeTip as THREE.Object3D | undefined;
      if (tip) {
        const wp = new THREE.Vector3();
        tip.getWorldPosition(wp);
        stage.worldToLocal(wp);
        tipBadge.position.copy(wp).add(new THREE.Vector3(0.12, 0.1, 0.08));
        tipBadge.visible = true;
      } else {
        tipBadge.visible = false;
      }

      const rm = removeGhost.material as THREE.MeshStandardMaterial;
      const pm = preserveGhost.material as THREE.MeshStandardMaterial;
      rm.opacity = removeAmt * (0.15 + 0.55 * Math.sin(u * Math.PI));
      pm.opacity = preserveAmt * (0.2 + 0.4 * (1 - Math.abs(u - 0.5) * 2));

      if (animPhase === "lingual" || animPhase === "cingulum") {
        removeGhost.scale.set(0.45, 0.45, 0.3);
        removeGhost.position.set(0, 0.12, -0.22);
        preserveGhost.scale.set(0.55, 0.22, 0.18);
        preserveGhost.position.set(0, -0.22, -0.28);
      } else if (animPhase === "cervix") {
        removeGhost.scale.set(0.7, 0.16, 0.65);
        removeGhost.position.set(0, -0.02, 0);
        preserveGhost.scale.set(0.5, 0.3, 0.5);
        preserveGhost.position.set(0, 0.15, 0);
      } else {
        removeGhost.scale.set(0.65, 0.9, 0.58);
        removeGhost.position.set(0.05, 0.08, 0.04);
        preserveGhost.scale.set(0.35, 0.4, 0.32);
        preserveGhost.position.set(0, -0.4, 0);
      }

      setProgress(u);
    };

    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (playing && !pausedRef.current) {
        tProg = Math.min(1, tProg + dt / duration);
        apply(tProg);
        if (tProg >= 1) playing = false;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    apply(0);
    animate();

    camApi.current = {
      setView: (v: TeachingView) => {
        camera.position.copy(cameraForView(v, mirror));
        controls.target.set(0, 0.05, 0);
        controls.update();
      },
    };
    camApi.current.setView(view);

    const onResize = () => {
      const nw = el.clientWidth || w;
      const nh = Math.max(300, Math.min(460, Math.round(nw * 0.68)));
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    const onPause = (e: Event) => {
      pausedRef.current = Boolean((e as CustomEvent).detail);
    };
    el.addEventListener("clip-pause", onPause);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("clip-pause", onPause);
      camApi.current = null;
      controls.dispose();
      renderer.dispose();
      el.innerHTML = "";
    };
  }, [animPhase, startBlend, endBlend, stepId, replayKey, toothNumber, teaching, activeKind]);

  useEffect(() => {
    camApi.current?.setView(view);
  }, [view]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    el.dispatchEvent(new CustomEvent("clip-pause", { detail: paused }));
  }, [paused]);

  return (
    <div className="step-clip">
      <div className="step-clip__head">
        <p className="step-clip__label">
          Demonstração 3D · FDI {toothNumber}
          {toothNumber === 21 ? " (espelho do 11)" : ""} · {INSTRUMENT_LABEL[activeKind]}
        </p>
        <div className="step-clip__actions">
          <button
            type="button"
            className={`step-clip__btn${paused ? " is-on" : ""}`}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? "Continuar" : "Pausar"}
          </button>
          <button
            type="button"
            className="step-clip__btn"
            onClick={() => {
              setPaused(false);
              setReplayKey((k) => k + 1);
            }}
          >
            Repetir
          </button>
        </div>
      </div>

      <div className="step-clip__views" role="group" aria-label="Vistas">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`step-clip__view${view === v.id ? " is-on" : ""}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div
        className="step-clip__viewport step-clip__viewport--video"
        ref={mountRef}
        aria-label={`Demonstração 3D da etapa ${stepId}`}
      />

      <div className="step-clip__bar" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      {teaching && (
        <dl className="step-clip__card">
          <div>
            <dt>Ação</dt>
            <dd>{teaching.action}</dd>
          </div>
          <div>
            <dt>Instrumento</dt>
            <dd>{teaching.instrument}</dd>
          </div>
          <div>
            <dt>Ponta ativa</dt>
            <dd>{teaching.activeTip}</dd>
          </div>
          <div>
            <dt className="is-remove">Remover</dt>
            <dd>{teaching.remove}</dd>
          </div>
          <div>
            <dt className="is-keep">Preservar</dt>
            <dd>{teaching.preserve}</dd>
          </div>
          <div>
            <dt>Resultado</dt>
            <dd>{teaching.result}</dd>
          </div>
        </dl>
      )}

      <p className="step-clip__legend">
        <span className="step-clip__swatch step-clip__swatch--remove" /> Remover{" "}
        <span className="step-clip__swatch step-clip__swatch--keep" /> Preservar · ponta ativa em destaque amarelo
      </p>
    </div>
  );
}

export function blendsForSteps(
  steps: { animPhase?: AnimPhase }[],
  index: number,
): { start: number; end: number } {
  const phase = (steps[index]?.animPhase ?? "rough-cut") as AnimPhase;
  const prev = index > 0 ? (steps[index - 1]?.animPhase as AnimPhase | undefined) : undefined;
  const start = index === 0 ? 0 : blendForAnimPhase(prev ?? phase);
  const end = blendForAnimPhase(phase);
  return { start, end };
}
