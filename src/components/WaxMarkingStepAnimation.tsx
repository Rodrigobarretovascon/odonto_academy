import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface WaxMarkingStepAnimationProps {
  toothNumber: number;
  stepTitle: string;
}

type Phase = "idle" | "ruler" | "cervical" | "labels" | "hold";

function makeLabelSprite(letter: string, name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // pill background
  const padX = 28;
  const padY = 36;
  ctx.fillStyle = "rgba(15, 30, 61, 0.88)";
  roundRect(ctx, padX, padY, canvas.width - padX * 2, canvas.height - padY * 2, 28);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 92px Montserrat, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${letter}:`, canvas.width / 2, canvas.height / 2 - 28);

  ctx.font = "600 48px Montserrat, Arial, sans-serif";
  ctx.fillStyle = "#c9a96a";
  ctx.fillText(name, canvas.width / 2, canvas.height / 2 + 42);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    opacity: 0,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.72, 0.36, 1);
  return sprite;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeRuler() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.06, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xd8dee8, metalness: 0.15, roughness: 0.45 }),
  );
  group.add(body);

  const tickMat = new THREE.MeshStandardMaterial({ color: 0x2d5596, roughness: 0.4 });
  for (let i = 0; i <= 12; i += 1) {
    const tall = i % 5 === 0;
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, tall ? 0.085 : 0.05, 0.02),
      tickMat,
    );
    tick.position.set(-0.6 + i * 0.1, 0.055, 0.07);
    group.add(tick);
  }
  return group;
}

/**
 * Passo 1 — Incisivo central superior:
 * régua medindo, linha cervical e rótulos V / L / M / D no bloco de cera.
 */
export function WaxMarkingStepAnimation({ toothNumber, stepTitle }: WaxMarkingStepAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [caption, setCaption] = useState("Toque para iniciar a animação");
  const playingRef = useRef(true);
  const timeRef = useRef(0);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!active) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f7fb);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 40);
    camera.position.set(1.55, 0.85, 2.1);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xfff4e5, 1.05);
    key.position.set(2.4, 3.2, 2.2);
    const fill = new THREE.DirectionalLight(0xb7c8e6, 0.4);
    fill.position.set(-2.2, 1.1, -1.4);
    scene.add(key, fill);

    const stage = new THREE.Group();
    scene.add(stage);

    // Bloco de cera (proporção de incisivo)
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.35, 0.78),
      new THREE.MeshStandardMaterial({
        color: 0xe8d5a8,
        roughness: 0.7,
        metalness: 0.02,
      }),
    );
    stage.add(block);

    // Linha cervical (anel fino ao redor do bloco)
    const cervicalY = -0.12;
    const cervical = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.012, 10, 48),
      new THREE.MeshStandardMaterial({
        color: 0x1f3a66,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0,
      }),
    );
    cervical.rotation.x = Math.PI / 2;
    cervical.position.y = cervicalY;
    cervical.scale.set(0.88, 0.78, 1);
    stage.add(cervical);

    // Traço frontal da cervical (mais visível)
    const cervicalFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.018, 0.02),
      new THREE.MeshStandardMaterial({
        color: 0x0f1e3d,
        transparent: true,
        opacity: 0,
      }),
    );
    cervicalFront.position.set(0, cervicalY, 0.4);
    stage.add(cervicalFront);

    const ruler = makeRuler();
    ruler.position.set(-1.4, 0.1, 0.55);
    ruler.rotation.z = -0.08;
    ruler.visible = false;
    stage.add(ruler);

    // Estilete marcando
    const stylus = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.55, roughness: 0.3 }),
    );
    shaft.rotation.z = Math.PI / 2;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.1, 10),
      new THREE.MeshStandardMaterial({ color: 0x8e97a1, metalness: 0.6, roughness: 0.28 }),
    );
    tip.position.x = 0.4;
    tip.rotation.z = -Math.PI / 2;
    stylus.add(shaft, tip);
    stylus.visible = false;
    stage.add(stylus);

    const labels = [
      { letter: "V", name: "vestibular", pos: new THREE.Vector3(0, 0.25, 0.72) },
      { letter: "L", name: "lingual", pos: new THREE.Vector3(0, 0.25, -0.72) },
      { letter: "M", name: "mesial", pos: new THREE.Vector3(-0.72, 0.25, 0) },
      { letter: "D", name: "distal", pos: new THREE.Vector3(0.72, 0.25, 0) },
    ].map((item) => {
      const sprite = makeLabelSprite(item.letter, item.name);
      sprite.position.copy(item.pos);
      stage.add(sprite);
      return sprite;
    });

    let disposed = false;
    let frame = 0;
    const clock = new THREE.Clock();
    timeRef.current = 0;
    const CYCLE = 14; // segundos por loop completo
    let lastCaption = "";

    const setCap = (text: string) => {
      if (text === lastCaption) return;
      lastCaption = text;
      setCaption(text);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (playingRef.current) timeRef.current += dt;
      const t = (timeRef.current % CYCLE) / CYCLE;

      // câmera orbitando levemente
      const camA = 0.35 + t * 0.15;
      camera.position.x = 1.55 * Math.cos(camA) + 0.2;
      camera.position.z = 2.1 * Math.sin(camA + 0.9);
      camera.lookAt(0, 0.05, 0);

      let phase: Phase = "idle";
      if (t < 0.12) phase = "idle";
      else if (t < 0.32) phase = "ruler";
      else if (t < 0.52) phase = "cervical";
      else if (t < 0.9) phase = "labels";
      else phase = "hold";

      // reset opacities
      const cervicalMat = cervical.material as THREE.MeshStandardMaterial;
      const frontMat = cervicalFront.material as THREE.MeshStandardMaterial;

      if (phase === "idle") {
        setCap(`FDI ${toothNumber} · bloco de cera do incisivo central superior`);
        ruler.visible = false;
        stylus.visible = false;
        cervicalMat.opacity = 0;
        frontMat.opacity = 0;
        labels.forEach((s) => {
          (s.material as THREE.SpriteMaterial).opacity = 0;
        });
        stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, 0.15, 0.04);
      }

      if (phase === "ruler") {
        const local = (t - 0.12) / 0.2;
        setCap("Medindo o bloco com a régua…");
        ruler.visible = true;
        stylus.visible = false;
        ruler.position.x = THREE.MathUtils.lerp(-1.35, -0.05, local);
        ruler.position.y = THREE.MathUtils.lerp(0.55, -0.35, Math.sin(local * Math.PI));
        ruler.position.z = 0.55;
        cervicalMat.opacity = 0;
        frontMat.opacity = 0;
        labels.forEach((s) => {
          (s.material as THREE.SpriteMaterial).opacity = 0;
        });
        stage.rotation.y = 0.1;
      }

      if (phase === "cervical") {
        const local = (t - 0.32) / 0.2;
        setCap("Marcando a linha cervical na cera…");
        ruler.visible = false;
        stylus.visible = true;
        const x = THREE.MathUtils.lerp(-0.42, 0.42, local);
        stylus.position.set(x, cervicalY + 0.05, 0.55);
        stylus.rotation.set(0.15, 0, -0.4);
        cervicalMat.opacity = Math.min(1, local * 1.4);
        frontMat.opacity = Math.min(1, local * 1.5);
        // desenha “progresso” da linha frontal
        cervicalFront.scale.x = Math.max(0.05, local);
        labels.forEach((s) => {
          (s.material as THREE.SpriteMaterial).opacity = 0;
        });
        stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, 0.05, 0.05);
      }

      if (phase === "labels") {
        const local = (t - 0.52) / 0.38;
        ruler.visible = false;
        stylus.visible = false;
        cervicalMat.opacity = 1;
        frontMat.opacity = 1;
        cervicalFront.scale.x = 1;

        const idx = Math.min(3, Math.floor(local * 4));
        const names = [
          "V: vestibular — face externa",
          "L: lingual — face interna",
          "M: mesial — voltada à linha média",
          "D: distal — afastada da linha média",
        ];
        setCap(names[idx]);

        labels.forEach((sprite, i) => {
          const mat = sprite.material as THREE.SpriteMaterial;
          const appearAt = i / 4;
          const visible = local > appearAt;
          mat.opacity = visible ? Math.min(1, (local - appearAt) * 5) : 0;
          sprite.scale.setScalar(visible ? 0.72 + Math.sin((local - appearAt) * 8) * 0.02 : 0.6);
        });

        // gira para mostrar cada face
        const targetY = [0.05, Math.PI * 0.92, -Math.PI / 2.1, Math.PI / 2.1][idx];
        stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, targetY, 0.06);
      }

      if (phase === "hold") {
        setCap("Linha cervical + faces V · L · M · D marcadas");
        cervicalMat.opacity = 1;
        frontMat.opacity = 1;
        labels.forEach((s) => {
          (s.material as THREE.SpriteMaterial).opacity = 1;
        });
        stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, 0.25, 0.03);
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
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
  }, [active, toothNumber]);

  return (
    <div className="wax-anim wax-anim--marking">
      <div className="wax-anim__stage wax-anim__stage--tall" ref={mountRef}>
        {!active && (
          <button
            type="button"
            className="wax-anim__start"
            onClick={() => {
              setActive(true);
              setPlaying(true);
              setCaption("Iniciando…");
            }}
          >
            <span>Ver animação — Passo 1</span>
            <small>{stepTitle}</small>
          </button>
        )}
      </div>
      {active && (
        <div className="wax-anim__bar">
          <button type="button" className="btn-primary btn-outline--sm" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pausar" : "Continuar"}
          </button>
          <p className="wax-anim__hint">{caption}</p>
        </div>
      )}
    </div>
  );
}
