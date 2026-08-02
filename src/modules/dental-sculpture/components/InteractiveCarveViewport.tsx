import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { AnimPhase } from "../../../data/sculpture-scripts";
import { MOVEMENT_PROFILES } from "../data/movements";
import type { StepVisualMode } from "../data/stepMeta";
import { DEBUG_RENDERER_INFO, DEBUG_TOOL_CONTACT } from "../lib/debugFlags";
import { createProceduralIncisor, SCULPTURE_LAYERS } from "../lib/proceduralIncisor";
import { loadToolGroup, makeProceduralTool } from "../lib/proceduralTools";
import {
  approachFactor,
  samplePathSmooth,
} from "../lib/pathSampling";
import {
  outcomeBlendFactor,
  type PracticeVisualOutcome,
} from "../lib/practiceOutcomes";
import { disposeObject3D, projectTipToSurface } from "../lib/threeDispose";
import type { ActiveTip, SculptureLayerId, ToolAction } from "../types/interaction";

export type CarveCompareMode = "animate" | "before" | "after";
export type CarveFaceView = "V" | "P" | "M" | "D" | "I";

export interface InteractiveCarveViewportHandle {
  replay: () => void;
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setFaceView: (face: CarveFaceView) => void;
  focusTool: () => void;
  getUserPath: () => [number, number, number][];
  clearUserPath: () => void;
  setProgress: (p: number) => void;
  setReplayProgress: (p: number) => void;
}

interface Props {
  toothNumber: number;
  animPhase: AnimPhase;
  startBlend: number;
  endBlend: number;
  toolActions: ToolAction[];
  compareMode: CarveCompareMode;
  progress: number;
  playbackRate?: number;
  paused?: boolean;
  showMarks?: boolean;
  showRemoval?: boolean;
  showContact?: boolean;
  showGuidePath?: boolean;
  reduceMotion?: boolean;
  practiceMode?: boolean;
  practiceManipulate?: "tool" | "orbit";
  focusToolKey?: number;
  replayKey?: number;
  visualMode?: StepVisualMode;
  anatomyCompare?: boolean;
  compareOpacity?: number;
  activeLayers?: SculptureLayerId[];
  practiceOutcome?: PracticeVisualOutcome | null;
  showUserPath?: boolean;
  showIdealPath?: boolean;
  userPathOverride?: [number, number, number][];
  replayAttempt?: boolean;
  grazingLight?: boolean;
  faceLabels?: string[];
  followDemo?: boolean;
  particlesEnabled?: boolean;
  onProgress?: (p: number) => void;
  onPracticeSample?: (point: [number, number, number]) => void;
}

export type { PracticeVisualOutcome };

const FACE_CAM: Record<CarveFaceView, THREE.Vector3> = {
  V: new THREE.Vector3(0, 0.35, 2.45),
  P: new THREE.Vector3(0, 0.35, -2.45),
  M: new THREE.Vector3(-2.45, 0.3, 0.15),
  D: new THREE.Vector3(2.45, 0.3, 0.15),
  I: new THREE.Vector3(0.2, 2.55, 0.4),
};

function waxMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xb7d4d8,
    roughness: 0.78,
    metalness: 0.02,
  });
}

function overlayMat(color: number, opacity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

function pickAction(actions: ToolAction[], t: number) {
  if (actions.length === 0) return null;
  if (actions.length === 1) return { action: actions[0], localT: t };
  const seg = 1 / actions.length;
  const idx = Math.min(actions.length - 1, Math.floor(t / seg));
  const localT = (t - idx * seg) / seg;
  return { action: actions[idx], localT };
}

function makeLabelSprite(text: string, color = "#1e3a6e") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(8, 8, 112, 48);
  ctx.fillStyle = color;
  ctx.font = "bold 28px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, 64, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(0.28, 0.14, 1);
  return spr;
}

function approachKind(mt: ToolAction["movementType"]): "cut" | "scrape" | "mark" | "brush" | "default" {
  if (mt === "cut") return "cut";
  if (mt === "mark") return "mark";
  if (mt === "brush" || mt === "polish") return "brush";
  if (mt === "scrape" || mt === "carve") return "scrape";
  return "default";
}

/**
 * Viewport de escultura interativa — progresso único, contato com superfície, slerp.
 */
export const InteractiveCarveViewport = forwardRef<InteractiveCarveViewportHandle, Props>(
  function InteractiveCarveViewport(props, ref) {
    const {
      toothNumber,
      animPhase,
      startBlend,
      endBlend,
      toolActions,
      compareMode,
      progress,
      paused = false,
      reduceMotion = false,
      practiceMode = false,
      practiceManipulate = "orbit",
      focusToolKey = 0,
      replayKey = 0,
      visualMode = "tool-path",
      followDemo = true,
      faceLabels,
      onProgress,
      onPracticeSample,
    } = props;

    const mountRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<{
      replay: () => void;
      resetCamera: () => void;
      zoomIn: () => void;
      zoomOut: () => void;
      setFaceView: (f: CarveFaceView) => void;
      focusTool: () => void;
      getUserPath: () => [number, number, number][];
      clearUserPath: () => void;
      setProgress: (p: number) => void;
      setReplayProgress: (p: number) => void;
    } | null>(null);

    // Props voláteis via refs — evitam remount WebGL
    const propsRef = useRef(props);
    propsRef.current = props;
    const progressRef = useRef(progress);
    progressRef.current = progress;

    useImperativeHandle(ref, () => ({
      replay: () => apiRef.current?.replay(),
      resetCamera: () => apiRef.current?.resetCamera(),
      zoomIn: () => apiRef.current?.zoomIn(),
      zoomOut: () => apiRef.current?.zoomOut(),
      setFaceView: (f) => apiRef.current?.setFaceView(f),
      focusTool: () => apiRef.current?.focusTool(),
      getUserPath: () => apiRef.current?.getUserPath() ?? [],
      clearUserPath: () => apiRef.current?.clearUserPath(),
      setProgress: (p) => apiRef.current?.setProgress(p),
      setReplayProgress: (p) => apiRef.current?.setReplayProgress(p),
    }));

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      void toothNumber;
      const width = container.clientWidth || 480;
      const height = Math.max(300, Math.min(540, Math.round(width * 0.74)));

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf3f7fb);

      const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 80);
      camera.position.set(1.55, 0.55, 1.95);

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, reduceMotion ? 1.25 : 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.style.cursor = "grab";

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 1.05;
      controls.maxDistance = 5.8;
      controls.target.set(0, 0.05, 0);
      let userOrbiting = false;
      controls.addEventListener("start", () => {
        userOrbiting = true;
        renderer.domElement.style.cursor = "grabbing";
      });
      controls.addEventListener("end", () => {
        renderer.domElement.style.cursor = "grab";
      });

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xfff1dd, 1.05);
      key.position.set(2.4, 3.1, 2.2);
      const fill = new THREE.DirectionalLight(0xb8c9e8, 0.4);
      fill.position.set(-2.2, 1.1, -1.4);
      const rim = new THREE.DirectionalLight(0xffffff, 0.25);
      rim.position.set(0.2, 0.4, -2.5);
      const grazing = new THREE.DirectionalLight(0xffe8c8, 0);
      grazing.position.set(3.2, 0.15, 0.4);
      scene.add(key, fill, rim, grazing);

      const stage = new THREE.Group();
      scene.add(stage);

      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(1.35, 48),
        new THREE.MeshStandardMaterial({
          color: 0xe4ecf5,
          roughness: 1,
          transparent: true,
          opacity: 0.9,
        }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.78;
      stage.add(ground);

      const block = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.85), waxMat());
      block.name = "layer-block";
      stage.add(block);

      const tooth = createProceduralIncisor(1);
      tooth.scale.setScalar(0.95);
      tooth.name = "tooth-work";
      stage.add(tooth);

      const idealGhost = createProceduralIncisor(1);
      idealGhost.scale.setScalar(0.95);
      const idealMat = idealGhost.material as THREE.MeshStandardMaterial;
      idealMat.color.setHex(0x6ea8d8);
      idealMat.transparent = true;
      idealMat.opacity = 0.3;
      idealMat.depthWrite = false;
      idealMat.polygonOffset = true;
      idealMat.polygonOffsetFactor = 1;
      idealGhost.visible = false;
      stage.add(idealGhost);

      const excessMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), overlayMat(0xc45a7a, 0.35));
      excessMesh.visible = false;
      stage.add(excessMesh);
      const deficitMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), overlayMat(0x3d9b6e, 0.35));
      deficitMesh.visible = false;
      deficitMesh.position.set(0.15, 0.2, 0.2);
      stage.add(deficitMesh);

      const protect = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.35), overlayMat(0x3d9b6e, 0.22));
      protect.visible = false;
      stage.add(protect);

      const ghost = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.35, 0.95), overlayMat(0xc45a7a, 0.26));
      ghost.visible = false;
      stage.add(ghost);

      const overlayGroup = new THREE.Group();
      stage.add(overlayGroup);

      const buildOverlays = () => {
        overlayGroup.clear();
        const labels = faceLabels?.length
          ? faceLabels
          : visualMode === "highlight-faces"
            ? ["V", "P", "M", "D", "I"]
            : [];
        if (labels.length) {
          const map: Record<string, [number, number, number]> = {
            V: [0, 0.15, 0.55],
            P: [0, 0.1, -0.55],
            M: [-0.5, 0.1, 0],
            D: [0.5, 0.1, 0],
            I: [0, 0.58, 0.1],
            cervical: [0, -0.45, 0.35],
          };
          for (const L of labels) {
            const spr = makeLabelSprite(L);
            spr.position.set(...(map[L] ?? [0, 0, 0.5]));
            overlayGroup.add(spr);
          }
        }
        if (visualMode === "symmetry-compare" || visualMode === "measure-overlay") {
          const mid = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, -0.55, 0.5),
              new THREE.Vector3(0, 0.55, 0.5),
            ]),
            new THREE.LineBasicMaterial({ color: 0x1e3a6e }),
          );
          overlayGroup.add(mid);
        }
        if (visualMode === "instrument-swap") {
          const s = makeProceduralTool("scalpel");
          s.position.set(-0.55, 0.35, 0.6);
          s.scale.setScalar(0.85);
          const l = makeProceduralTool("lecron");
          l.position.set(0.55, 0.35, 0.6);
          l.scale.setScalar(0.85);
          const ls = makeLabelSprite("Estilete");
          ls.position.set(-0.55, 0.7, 0.6);
          const ll = makeLabelSprite("Lecron");
          ll.position.set(0.55, 0.7, 0.6);
          overlayGroup.add(s, l, ls, ll);
        }
      };
      buildOverlays();

      const guideGroup = new THREE.Group();
      stage.add(guideGroup);
      const userPathGroup = new THREE.Group();
      stage.add(userPathGroup);

      const contact = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffe066,
          emissive: 0xffc107,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.9,
        }),
      );
      contact.visible = false;
      stage.add(contact);

      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(),
        0.35,
        0x1e3a6e,
        0.1,
        0.07,
      );
      arrow.visible = false;
      stage.add(arrow);

      // Debug helpers (dev only)
      const debugGroup = new THREE.Group();
      debugGroup.visible = Boolean(DEBUG_TOOL_CONTACT);
      stage.add(debugGroup);
      const debugTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff2244 }),
      );
      const debugNormal = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.2, 0x22aa66);
      const debugLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: 0xff8800 }),
      );
      const debugAxis = new THREE.AxesHelper(0.18);
      debugGroup.add(debugTip, debugNormal, debugLine, debugAxis);

      let disposed = false;
      const tools: Record<string, THREE.Group> = {
        lecron: makeProceduralTool("lecron"),
        scalpel: makeProceduralTool("scalpel"),
        ruler: makeProceduralTool("ruler"),
        brush: makeProceduralTool("brush"),
        nylon: makeProceduralTool("fabric"),
      };
      Object.values(tools).forEach((t) => {
        t.visible = false;
        stage.add(t);
      });
      const cancelGlb: Array<() => void> = [];
      (["lecron", "scalpel", "ruler", "brush", "nylon"] as const).forEach((id) => {
        cancelGlb.push(
          loadToolGroup(id, (group, fromGlb) => {
            if (!fromGlb || disposed) return;
            const old = tools[id];
            group.visible = old.visible;
            group.position.copy(old.position);
            group.quaternion.copy(old.quaternion);
            stage.remove(old);
            disposeObject3D(old);
            tools[id] = group;
            stage.add(group);
          }),
        );
      });

      const maxScrap = reduceMotion ? 10 : 36;
      const scrapGeo = new THREE.BoxGeometry(0.022, 0.009, 0.035);
      const scrapMat = new THREE.MeshStandardMaterial({ color: 0xa8c8cc, roughness: 0.9 });
      const scraps = new THREE.InstancedMesh(scrapGeo, scrapMat, maxScrap);
      scraps.count = 0;
      stage.add(scraps);
      const scrapData: { life: number; vel: THREE.Vector3; pos: THREE.Vector3 }[] = [];
      const dummy = new THREE.Object3D();

      let frame = 0;
      let userPath: [number, number, number][] = [];
      let dragging = false;
      let animPlaying = compareMode === "animate" && !practiceMode && !paused;
      let localProgress = practiceMode ? 0 : progressRef.current;
      let replayT = 0;
      let tabVisible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;

      const surfaceRay = new THREE.Raycaster();

      const rebuildGuides = () => {
        while (guideGroup.children.length) {
          const c = guideGroup.children[0];
          guideGroup.remove(c);
          disposeObject3D(c);
        }
        const p = propsRef.current;
        if ((!p.showGuidePath && !p.showIdealPath) || toolActions.length === 0) return;
        for (const action of toolActions) {
          const pts = action.path.map((pt) => new THREE.Vector3(...pt.position));
          if (pts.length < 2) continue;
          const curve = new THREE.CatmullRomCurve3(pts);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
            new THREE.LineBasicMaterial({
              color: 0x2d5596,
              transparent: true,
              opacity: practiceMode ? 0.4 : 0.65,
            }),
          );
          const tag = makeLabelSprite("Ideal", "#2d5596");
          tag.position.copy(pts[0]).add(new THREE.Vector3(0, 0.08, 0));
          guideGroup.add(line, tag);
        }
      };
      rebuildGuides();

      const rebuildUserPathLine = (pts: [number, number, number][]) => {
        while (userPathGroup.children.length) {
          const c = userPathGroup.children[0];
          userPathGroup.remove(c);
          disposeObject3D(c);
        }
        if (!propsRef.current.showUserPath || pts.length < 2) return;
        const vectors = pts.map((pt) => new THREE.Vector3(...pt));
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(vectors),
          new THREE.LineDashedMaterial({
            color: 0xc45a7a,
            dashSize: 0.035,
            gapSize: 0.022,
            transparent: true,
            opacity: 0.85,
          }),
        );
        line.computeLineDistances();
        const tag = makeLabelSprite("Aluno", "#c45a7a");
        tag.position.copy(vectors[0]).add(new THREE.Vector3(0, -0.08, 0));
        userPathGroup.add(line, tag);
      };

      const layerVisible = (id: SculptureLayerId, carve: number) => {
        const layers = propsRef.current.activeLayers;
        if (!layers || layers.length === 0) return true;
        if (!layers.includes(id)) return false;
        const def = SCULPTURE_LAYERS.find((l) => l.id === id);
        return carve >= (def?.minBlend ?? 0) - 0.05;
      };

      const clearScraps = () => {
        scrapData.length = 0;
        scraps.count = 0;
        scraps.instanceMatrix.needsUpdate = true;
      };

      const applyCarve = (carve: number) => {
        const outcome = propsRef.current.practiceOutcome;
        let factor = 1;
        if (outcome) factor = outcomeBlendFactor(outcome);
        const effective = Math.min(1.05, carve * (practiceMode && outcome ? factor : 1));

        const sx = 1 - effective * 0.55;
        const sy = 1 - effective * 0.12;
        const sz = 1 - effective * 0.48;
        block.scale.set(sx, sy, sz);
        block.position.y = -effective * 0.04;
        const bm = block.material as THREE.MeshStandardMaterial;
        bm.transparent = effective > 0.5;
        bm.opacity = Math.max(0, 1 - Math.max(0, effective - 0.5) * 2.2);
        block.visible = layerVisible("block", effective) && effective < 0.92;

        const detail = Math.min(1, Math.max(0, (effective - 0.15) / 0.75));
        tooth.visible = layerVisible("anatomic", effective) || effective > 0.1;
        tooth.scale.setScalar(0.55 + effective * 0.42);
        const tm = tooth.material as THREE.MeshStandardMaterial;
        tm.opacity = Math.min(1, 0.35 + detail * 0.65);
        tm.transparent = tm.opacity < 0.98;
        if (outcome === "insufficient") {
          tooth.scale.multiplyScalar(0.92);
        } else if (outcome === "excessive") {
          tooth.scale.multiplyScalar(0.88);
          tm.color.setHex(0xa8c0c4);
        } else {
          tm.color.setHex(0xc5dde0);
        }
      };

      const highlightTip = (tool: THREE.Object3D, tip?: ActiveTip) => {
        tool.traverse((c) => {
          if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
            c.material.emissive?.setHex(0x000000);
            c.material.emissiveIntensity = 0;
          }
        });
        const name =
          tip === "spoon"
            ? "tip-spoon"
            : tip === "blade"
              ? "tip-blade"
              : tip === "knife"
                ? "tip-knife"
                : tip === "brush"
                  ? "tip-brush"
                  : tip === "fabric"
                    ? "tip-fabric"
                    : null;
        if (!name) return;
        const tipMesh = tool.getObjectByName(name);
        if (tipMesh instanceof THREE.Mesh && tipMesh.material instanceof THREE.MeshStandardMaterial) {
          tipMesh.material.emissive.setHex(0x2d5596);
          tipMesh.material.emissiveIntensity = 0.55;
        } else if (tipMesh) {
          tipMesh.traverse((c) => {
            if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
              c.material.emissive.setHex(0x2d5596);
              c.material.emissiveIntensity = 0.4;
            }
          });
        }
      };

      const spawnScrap = (at: THREE.Vector3, amount: number) => {
        if (!propsRef.current.particlesEnabled || reduceMotion || amount < 0.12) return;
        const n = amount > 0.55 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          if (scrapData.length >= maxScrap) scrapData.shift();
          scrapData.push({
            life: 0.7 + Math.random() * 0.35,
            vel: new THREE.Vector3(
              (Math.random() - 0.5) * 0.25,
              0.08 + Math.random() * 0.2,
              (Math.random() - 0.5) * 0.25,
            ),
            pos: at.clone().add(
              new THREE.Vector3((Math.random() - 0.5) * 0.04, 0.01, (Math.random() - 0.5) * 0.04),
            ),
          });
        }
      };

      const updateScraps = (dt: number) => {
        for (let i = scrapData.length - 1; i >= 0; i--) {
          const s = scrapData[i];
          s.life -= dt;
          s.vel.y -= 1.2 * dt;
          s.pos.addScaledVector(s.vel, dt);
          if (s.life <= 0 || s.pos.y < -0.75) scrapData.splice(i, 1);
        }
        scraps.count = scrapData.length;
        scrapData.forEach((s, i) => {
          dummy.position.copy(s.pos);
          dummy.rotation.set(s.life, s.life * 2, 0);
          dummy.scale.setScalar(0.6 + s.life * 0.35);
          dummy.updateMatrix();
          scraps.setMatrixAt(i, dummy.matrix);
        });
        scraps.instanceMatrix.needsUpdate = true;
      };

      const hideTools = () => {
        Object.values(tools).forEach((t) => {
          t.visible = false;
        });
      };

      const toolKeyFor = (toolId: string) =>
        toolId === "scalpel"
          ? "scalpel"
          : toolId === "ruler"
            ? "ruler"
            : toolId === "brush"
              ? "brush"
              : toolId === "nylon"
                ? "nylon"
                : "lecron";

      const placeTool = (t: number) => {
        const p = propsRef.current;
        hideTools();
        arrow.visible = false;
        contact.visible = false;
        debugGroup.visible = Boolean(DEBUG_TOOL_CONTACT);

        if (visualMode === "instrument-swap") return;
        if (toolActions.length === 0) return;

        const picked = pickAction(toolActions, t);
        if (!picked) return;
        const { action, localT } = picked;
        const profile = MOVEMENT_PROFILES[action.movementType];
        const sample = samplePathSmooth(action.path, localT);
        const engage = approachFactor(localT, approachKind(action.movementType));

        // Snap à superfície
        const projected = projectTipToSurface(surfaceRay, tooth, sample.position, 0.016 + (1 - engage) * 0.08);
        const tipPos = projected
          ? projected.point.clone().lerp(sample.position, 1 - engage * 0.85)
          : sample.position.clone();

        // Offset do cabo: ponta knife em +X local, spoon em −X
        const tipOffset = new THREE.Vector3(
          action.activeTip === "spoon" ? 0.48 : action.activeTip === "blade" ? -0.34 : -0.5,
          0,
          0,
        );
        tipOffset.applyQuaternion(sample.quaternion);

        const tool = tools[toolKeyFor(action.toolId)];
        tool.visible = true;
        highlightTip(tool, action.activeTip);
        tool.quaternion.copy(sample.quaternion);
        tool.position.copy(tipPos).sub(tipOffset);

        // Evita cabo atravessar: empurra ligeiramente para fora
        if (projected) {
          tool.position.addScaledVector(projected.normal, 0.01);
        }

        if (action.toolId === "nylon") {
          tool.rotateX(Math.sin(localT * Math.PI * 2) * 0.12);
        }

        const inContact = engage > 0.45 && localT > 0.06 && localT < 0.94;
        if (p.showContact && inContact && projected) {
          contact.visible = true;
          contact.position.copy(projected.point);
        }

        if (!practiceMode && localT > 0.05 && localT < 0.95) {
          arrow.visible = true;
          arrow.position.copy(tipPos);
          arrow.setDirection(sample.tangent);
          arrow.setLength(0.28, 0.08, 0.05);
        }

        if (DEBUG_TOOL_CONTACT && projected) {
          debugTip.position.copy(tipPos);
          debugNormal.position.copy(projected.point);
          debugNormal.setDirection(projected.normal);
          debugAxis.position.copy(tool.position);
          debugAxis.quaternion.copy(tool.quaternion);
          const geo = debugLine.geometry as THREE.BufferGeometry;
          geo.setFromPoints([tipPos.clone(), projected.point.clone()]);
        }

        const cutting = ["cut", "scrape", "carve", "round"].includes(action.movementType);
        ghost.visible = Boolean(p.showRemoval && cutting && compareMode !== "after" && t < 0.98);
        if (ghost.visible) {
          if (action.removalRegion === "fossa-center") {
            ghost.scale.set(0.42, 0.4, 0.28);
            ghost.position.set(0, 0.1, -0.3);
            protect.visible = Boolean(p.showMarks);
            protect.scale.set(0.75, 0.38, 0.38);
            protect.position.set(0, -0.28, -0.35);
          } else if (action.removalRegion === "cervical-excess") {
            ghost.scale.set(1.0, 0.14, 1.0);
            ghost.position.set(0, -0.04, 0);
            protect.visible = Boolean(p.showMarks);
            protect.scale.set(0.72, 0.42, 0.72);
            protect.position.set(0, 0.08, 0);
          } else {
            ghost.scale.set(0.95, 0.9, 0.95);
            ghost.position.set(0.03, 0, 0.03);
            protect.visible = Boolean(p.showMarks && action.removalRegion);
          }
        } else {
          protect.visible = false;
        }

        const brushOrPolish = action.movementType === "brush" || action.movementType === "polish";
        if (
          !practiceMode &&
          !p.paused &&
          animPlaying &&
          inContact &&
          projected
        ) {
          spawnScrap(
            projected.point,
            brushOrPolish
              ? profile.residue * 0.4
              : profile.residue * (action.removalStrength ?? 0.4) * engage,
          );
        }
      };

      const currentCarve = () => {
        if (compareMode === "before") return startBlend;
        const t = practiceMode
          ? propsRef.current.practiceOutcome
            ? 1
            : Math.min(1, userPath.length / 40)
          : localProgress;
        return startBlend + (endBlend - startBlend) * t;
      };

      const setFaceView = (face: CarveFaceView, force = false) => {
        if (!force && !propsRef.current.followDemo && userOrbiting) return;
        camera.position.copy(FACE_CAM[face]);
        controls.target.set(0, face === "I" ? 0.2 : 0.05, 0);
        controls.update();
      };

      apiRef.current = {
        replay: () => {
          localProgress = 0;
          replayT = 0;
          animPlaying = !practiceMode;
          userPath = [];
          clearScraps();
          userPathGroup.clear();
          onProgress?.(0);
        },
        resetCamera: () => {
          userOrbiting = false;
          camera.position.set(1.55, 0.55, 1.95);
          controls.target.set(0, 0.05, 0);
          controls.update();
        },
        zoomIn: () => {
          const dir = new THREE.Vector3().subVectors(camera.position, controls.target).multiplyScalar(0.8);
          camera.position.copy(controls.target).add(dir);
          controls.update();
        },
        zoomOut: () => {
          const dir = new THREE.Vector3()
            .subVectors(camera.position, controls.target)
            .multiplyScalar(1.25);
          camera.position.copy(controls.target).add(dir);
          controls.update();
        },
        setFaceView: (f) => setFaceView(f, true),
        focusTool: () => {
          const visible = Object.values(tools).find((t) => t.visible) ?? tools.lecron;
          const pos = visible.position.clone();
          camera.position.copy(pos).add(new THREE.Vector3(0.55, 0.35, 0.75));
          controls.target.copy(pos);
          controls.update();
        },
        getUserPath: () => userPath.slice(),
        clearUserPath: () => {
          userPath = [];
          while (userPathGroup.children.length) {
            const c = userPathGroup.children[0];
            userPathGroup.remove(c);
            disposeObject3D(c);
          }
        },
        setProgress: (prog: number) => {
          localProgress = prog;
          progressRef.current = prog;
          animPlaying = false;
        },
        setReplayProgress: (prog: number) => {
          replayT = prog;
        },
      };

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const onPointerDown = (e: PointerEvent) => {
        if (!practiceMode || practiceManipulate !== "tool") return;
        dragging = true;
        controls.enabled = false;
        renderer.domElement.style.cursor = "crosshair";
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        e.preventDefault();
      };
      const onPointerUp = () => {
        dragging = false;
        controls.enabled = practiceManipulate !== "tool" || !practiceMode;
        renderer.domElement.style.cursor = practiceMode && practiceManipulate === "tool" ? "crosshair" : "grab";
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!practiceMode || !dragging || practiceManipulate !== "tool") return;
        e.preventDefault();
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(tooth, true);
        let hitPoint: THREE.Vector3 | null = null;
        if (hits[0]) hitPoint = hits[0].point.clone();
        else {
          const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.55);
          const hit = new THREE.Vector3();
          if (raycaster.ray.intersectSphere(sphere, hit)) hitPoint = hit;
        }
        if (!hitPoint) return;
        const tid = toolActions[0]?.toolId ?? "lecron";
        const tool = tools[toolKeyFor(tid)];
        tool.visible = true;
        const projected = projectTipToSurface(surfaceRay, tooth, hitPoint, 0.018);
        const pos = projected?.point ?? hitPoint;
        tool.position.copy(pos);
        tool.lookAt(0, pos.y * 0.25, 0);
        const sample: [number, number, number] = [pos.x, pos.y, pos.z];
        userPath.push(sample);
        if (userPath.length > 240) userPath.shift();
        onPracticeSample?.(sample);
        contact.visible = Boolean(propsRef.current.showContact);
        contact.position.copy(pos);
        spawnScrap(pos, 0.28);
        if (propsRef.current.showUserPath) rebuildUserPathLine(userPath);
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      controls.enabled = !(practiceMode && practiceManipulate === "tool");

      // Câmera inicial só se seguir demonstração
      if (followDemo) {
        if (animPhase === "cervix") setFaceView("V", true);
        else if (animPhase === "cingulum" || animPhase === "lingual") setFaceView("P", true);
        else if (animPhase === "rough-cut") setFaceView("M", true);
        else if (animPhase === "thirds") setFaceView("V", true);
      }

      localProgress = practiceMode ? 0 : progressRef.current;
      animPlaying = compareMode === "animate" && !practiceMode && !paused;

      const onVisibility = () => {
        tabVisible = document.visibilityState === "visible";
      };
      document.addEventListener("visibilitychange", onVisibility);

      let debugLogAcc = 0;
      const clock = new THREE.Clock();
      const animate = () => {
        frame = requestAnimationFrame(animate);
        if (!tabVisible) return;
        const dt = Math.min(0.05, clock.getDelta());
        const p = propsRef.current;

        grazing.intensity = p.grazingLight || visualMode === "grazing-light" ? 1.35 : 0;
        key.intensity = grazing.intensity > 0 ? 0.35 : 1.05;

        const playing =
          compareMode === "animate" && !practiceMode && !p.paused && !p.replayAttempt;
        if (playing && animPlaying) {
          const speed = 0.22 * Math.max(0.2, p.playbackRate ?? 1);
          localProgress = Math.min(1, localProgress + dt * speed);
          progressRef.current = localProgress;
          onProgress?.(localProgress);
          if (localProgress >= 1) animPlaying = false;
        } else if (!animPlaying || p.paused || compareMode !== "animate") {
          localProgress = progressRef.current;
        }

        if (p.replayAttempt && p.userPathOverride?.length) {
          const pts = p.userPathOverride;
          const idx = Math.min(pts.length - 1, Math.floor(replayT * (pts.length - 1)));
          const pt = pts[idx];
          const tid = toolActions[0]?.toolId ?? "lecron";
          const tool = tools[toolKeyFor(tid)];
          hideTools();
          tool.visible = true;
          tool.position.set(...pt);
          rebuildUserPathLine(pts);
        }

        const { anatomyCompare: onCmp, compareOpacity: op } = p;
        idealGhost.visible = Boolean(onCmp);
        if (onCmp) {
          idealMat.opacity = op ?? 0.35;
          excessMesh.visible = true;
          deficitMesh.visible = true;
          excessMesh.position.set(0.28, 0.15, 0.25);
          deficitMesh.position.set(-0.2, -0.1, -0.28);
        } else {
          excessMesh.visible = false;
          deficitMesh.visible = false;
        }

        applyCarve(currentCarve());
        if (!practiceMode || !dragging) {
          if (!p.replayAttempt) {
            placeTool(practiceMode ? Math.min(0.15, userPath.length / 80) : localProgress);
          }
        }
        updateScraps(dt);
        controls.update();
        renderer.render(scene, camera);

        if (DEBUG_RENDERER_INFO) {
          debugLogAcc += dt;
          if (debugLogAcc > 2) {
            debugLogAcc = 0;
            // eslint-disable-next-line no-console
            console.debug("[carve-viewport]", renderer.info.memory, renderer.info.render);
          }
        }
      };
      animate();

      const onResize = () => {
        const w = container.clientWidth || width;
        const h = Math.max(300, Math.min(540, Math.round(w * 0.74)));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        disposed = true;
        cancelGlb.forEach((c) => c());
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        controls.dispose();
        disposeObject3D(scene);
        renderer.dispose();
        container.innerHTML = "";
        apiRef.current = null;
      };
    }, [
      // Remount só quando a cena estrutural muda
      toothNumber,
      animPhase,
      startBlend,
      endBlend,
      toolActions,
      compareMode,
      practiceMode,
      practiceManipulate,
      replayKey,
      visualMode,
      faceLabels,
      reduceMotion,
      followDemo,
      focusToolKey,
    ]);

    // Scrubber = fonte única externa
    useEffect(() => {
      apiRef.current?.setProgress(progress);
    }, [progress]);

    useEffect(() => {
      if (props.replayAttempt) apiRef.current?.setReplayProgress(progress);
    }, [progress, props.replayAttempt]);

    return (
      <div
        className="prog-wax immersive-carve"
        ref={mountRef}
        role="img"
        aria-label="Demonstração interativa de escultura em cera"
      />
    );
  },
);
