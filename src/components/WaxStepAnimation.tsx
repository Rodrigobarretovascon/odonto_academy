import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { getTooth3DAssets } from "../lib/toothModel3d";
import {
  blendForAnimPhase,
  captionForAnimPhase,
  explainersForAnimPhase,
  highlightedFacesForPhase,
  type AnimPhase,
} from "../data/sculpture-scripts";

interface WaxStepAnimationProps {
  toothNumber: number;
  stepId: number;
  stepTitle: string;
  animPhase?: AnimPhase;
  /** Instruções do card — usadas como legendas extras na animação. */
  instructions?: string[];
}

function waxMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xe8d5a8,
    roughness: 0.72,
    metalness: 0.02,
  });
}

function toothWaxMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xf2e6c9,
    roughness: 0.48,
    metalness: 0.0,
    transparent: true,
    opacity: 0.95,
  });
}

/**
 * Animação 3D didática: bloco → dente, com HUD explicativo por fase.
 */
export function WaxStepAnimation({
  toothNumber,
  stepId,
  stepTitle,
  animPhase = "rough-cut",
  instructions = [],
}: WaxStepAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const playingRef = useRef(true);
  const progressRef = useRef(0);

  const phaseCaption = captionForAnimPhase(animPhase);
  const explainers = explainersForAnimPhase(animPhase);
  const faces = highlightedFacesForPhase(animPhase);
  const tips = explainers.length > 0 ? explainers : instructions.slice(0, 4);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!active || tips.length === 0) return;
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [active, tips.length]);

  useEffect(() => {
    if (!active) return;
    const container = mountRef.current;
    if (!container) return;

    const assets = getTooth3DAssets(toothNumber);
    const width = container.clientWidth || 320;
    const height = 260;
    const targetBlend = blendForAnimPhase(animPhase);
    const showMarks = [
      "instruments",
      "measure",
      "thirds",
      "grid",
      "faces",
      "proximal-draw",
    ].includes(animPhase);
    const focusLingual = ["lingual", "cingulum"].includes(animPhase);
    const focusRoot = animPhase === "root";
    const focusIncisal = ["detail", "polish", "cervix", "cusps", "occlusal"].includes(animPhase);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f7fb);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 50);
    camera.position.set(1.35, 0.55, 1.85);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xfff2dd, 1.05);
    key.position.set(2.5, 3.2, 2);
    const fill = new THREE.DirectionalLight(0xb8c9e8, 0.42);
    fill.position.set(-2, 1, -1.5);
    scene.add(key, fill);

    const stage = new THREE.Group();
    scene.add(stage);

    const block = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.85), waxMaterial());
    stage.add(block);

    // Cotas de medida (fase measure)
    const dimGroup = new THREE.Group();
    const dimMat = new THREE.LineBasicMaterial({ color: 0xa33d63, transparent: true, opacity: 0.9 });
    const hPts = [new THREE.Vector3(-0.55, -0.65, 0.2), new THREE.Vector3(-0.55, 0.65, 0.2)];
    const wPts = [new THREE.Vector3(-0.48, -0.72, 0.45), new THREE.Vector3(0.48, -0.72, 0.45)];
    dimGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPts), dimMat));
    dimGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wPts), dimMat));
    stage.add(dimGroup);

    const toothGroup = new THREE.Group();
    toothGroup.visible = false;
    stage.add(toothGroup);

    const tool = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.85, 10),
      new THREE.MeshStandardMaterial({ color: 0xc0c6ce, metalness: 0.55, roughness: 0.35 }),
    );
    handle.rotation.z = Math.PI / 2;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.035, 0.14, 10),
      new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.65, roughness: 0.28 }),
    );
    tip.position.x = 0.48;
    tip.rotation.z = -Math.PI / 2;
    tool.add(handle, tip);
    stage.add(tool);

    const marks = new THREE.Group();
    const markMat = new THREE.LineBasicMaterial({
      color: 0x2d5596,
      transparent: true,
      opacity: 0.85,
    });
    for (const y of [-0.35, 0, 0.35]) {
      const pts = [new THREE.Vector3(-0.5, y, 0.44), new THREE.Vector3(0.5, y, 0.44)];
      marks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), markMat));
    }
    const outline = [
      new THREE.Vector3(-0.42, 0.55, 0.44),
      new THREE.Vector3(-0.38, -0.15, 0.44),
      new THREE.Vector3(-0.2, -0.45, 0.44),
      new THREE.Vector3(0.2, -0.45, 0.44),
      new THREE.Vector3(0.38, -0.15, 0.44),
      new THREE.Vector3(0.42, 0.55, 0.44),
    ];
    marks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outline), markMat));
    stage.add(marks);

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

    const applyWaxLook = (root: THREE.Object3D) => {
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = toothWaxMaterial();
        }
      });
    };

    const mountTooth = (obj: THREE.Object3D) => {
      if (disposed) return;
      applyWaxLook(obj);
      normalize(obj);
      toothGroup.clear();
      toothGroup.add(obj);
      toothGroup.visible = true;
    };

    loader.load(
      assets.objUrl,
      (obj) => mountTooth(obj),
      undefined,
      () => {
        const fallback = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.28, 0.7, 8, 16),
          toothWaxMaterial(),
        );
        mountTooth(fallback);
      },
    );

    progressRef.current = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (playingRef.current) {
        progressRef.current = (progressRef.current + dt * 0.2) % 1;
      }
      const t = progressRef.current;
      const carve = targetBlend * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, t * 1.15)));

      const blockScale = 1 - carve * 0.72;
      block.scale.set(blockScale, 1 - carve * 0.18, blockScale);
      block.position.y = -carve * 0.08;
      (block.material as THREE.MeshStandardMaterial).transparent = carve > 0.55;
      (block.material as THREE.MeshStandardMaterial).opacity = Math.max(
        0,
        1 - (carve - 0.55) * 2.2,
      );
      block.visible = carve < 0.92;

      dimGroup.visible = animPhase === "measure" && carve < 0.35;
      dimGroup.traverse((c) => {
        if (c instanceof THREE.Line && c.material instanceof THREE.LineBasicMaterial) {
          c.material.opacity = 0.55 + 0.4 * Math.sin(t * Math.PI * 2);
        }
      });

      toothGroup.visible = carve > 0.05;
      toothGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = Math.min(1, carve * 1.35);
          child.material.transparent = child.material.opacity < 0.98;
        }
      });
      toothGroup.scale.setScalar(0.55 + carve * 0.45);

      marks.visible = showMarks && carve < 0.5;
      marks.traverse((c) => {
        if (c instanceof THREE.Line && c.material instanceof THREE.LineBasicMaterial) {
          c.material.opacity = showMarks ? 0.45 + 0.45 * Math.sin(t * Math.PI * 2) : 0;
        }
      });

      const orbit = t * Math.PI * 2;
      const radius = 0.75 - carve * 0.25;
      tool.position.set(
        Math.cos(orbit) * radius,
        Math.sin(orbit * 1.3) * 0.35,
        Math.sin(orbit) * radius,
      );
      tool.lookAt(0, 0, 0);
      tool.visible = carve < 0.98 && animPhase !== "instruments";

      let camTarget = new THREE.Vector3(1.35, 0.55, 1.85);
      if (focusRoot) camTarget = new THREE.Vector3(1.1, -0.35, 1.7);
      else if (focusLingual) camTarget = new THREE.Vector3(-1.2, 0.4, 1.5);
      else if (focusIncisal) camTarget = new THREE.Vector3(0.35, 1.45, 1.25);
      else if (animPhase === "proximal-draw") camTarget = new THREE.Vector3(1.8, 0.2, 0.4);
      else if (animPhase === "occlusal" || animPhase === "cusps")
        camTarget = new THREE.Vector3(0.15, 1.7, 0.9);
      camera.position.lerp(camTarget, 0.045);
      camera.lookAt(0, focusRoot ? -0.25 : focusIncisal ? 0.15 : 0, 0);

      stage.rotation.y = t * 0.32;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [active, toothNumber, stepId, animPhase]);

  return (
    <div className="wax-anim wax-anim--explain">
      <div className="wax-anim__stage wax-anim__stage--tall" ref={mountRef}>
        {!active && (
          <button type="button" className="wax-anim__start" onClick={() => setActive(true)}>
            <span>Ver animação 3D explicativa</span>
            <small>
              Passo {stepId}: {stepTitle}
            </small>
          </button>
        )}

        {active && (
          <div className="wax-anim__hud" aria-live="polite">
            <div className="wax-anim__hud-top">
              <span className="wax-anim__badge">FDI {toothNumber}</span>
              <span className="wax-anim__phase">{phaseCaption}</span>
            </div>
            {faces.length > 0 && (
              <ul className="wax-anim__faces" aria-label="Faces em destaque">
                {(["V", "L", "M", "D", "O"] as const).map((f) => (
                  <li
                    key={f}
                    className={
                      faces.includes(f) ? "wax-anim__face wax-anim__face--on" : "wax-anim__face"
                    }
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {tips.length > 0 && (
              <p className="wax-anim__tip">
                <span className="wax-anim__tip-n">
                  {tipIndex + 1}/{tips.length}
                </span>
                {tips[tipIndex]}
              </p>
            )}
          </div>
        )}
      </div>

      {active && (
        <div className="wax-anim__bar">
          <button
            type="button"
            className="btn-primary btn-outline--sm"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Pausar" : "Continuar"}
          </button>
          <p className="wax-anim__hint">
            Bloco de cera → anatomia · {phaseCaption}
          </p>
        </div>
      )}

      {active && tips.length > 0 && (
        <ol className="wax-anim__guide">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
