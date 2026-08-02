import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { COMMON_ERRORS } from "../data/commonErrors";
import { createErrorIncisor } from "../lib/proceduralIncisor";
import type { CommonErrorId } from "../lib/proceduralIncisor";

function ErrorPreview({ errorId }: { errorId: CommonErrorId }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth || 220;
    const h = 180;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f7fb);
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 40);
    camera.position.set(1.4, 0.5, 1.7);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(2, 3, 2);
    scene.add(light);
    const mesh = createErrorIncisor(errorId);
    scene.add(mesh);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      controls.dispose();
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      renderer.dispose();
      el.innerHTML = "";
    };
  }, [errorId]);
  return <div className="error-preview" ref={ref} />;
}

export function CommonErrorsGallery({
  onReviewStep,
  onClose,
}: {
  onReviewStep: (order: number) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(COMMON_ERRORS[0].id);

  const item = COMMON_ERRORS.find((e) => e.id === active)!;

  return (
    <section className="immersive-panel immersive-errors" aria-label="Erros comuns">
      <div className="immersive-errors__head">
        <h2>Galeria de erros comuns</h2>
        <button type="button" className="immersive-lesson__ghost-btn" onClick={onClose}>
          Fechar
        </button>
      </div>
      <div className="immersive-errors__grid">
        <div className="immersive-errors__list">
          {COMMON_ERRORS.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`immersive-chip${active === e.id ? " is-on" : ""}`}
              onClick={() => setActive(e.id)}
            >
              {e.title}
            </button>
          ))}
        </div>
        <div className="immersive-errors__detail">
          <ErrorPreview errorId={item.id} />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>
            <strong>Motivo:</strong> {item.reason}
          </p>
          <p>
            <strong>Como corrigir:</strong> {item.howToFix}
          </p>
          <button
            type="button"
            className="immersive-lesson__primary-btn"
            onClick={() => onReviewStep(item.relatedStep)}
          >
            Rever fase {item.relatedStep}
          </button>
        </div>
      </div>
    </section>
  );
}
