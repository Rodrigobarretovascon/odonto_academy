import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { getTooth3DAssets } from "../lib/toothModel3d";

interface ToothModel3DProps {
  toothNumber: number;
}

function applyCrownRootColors(mesh: THREE.Mesh) {
  const geo = mesh.geometry;
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  if (!box) return;

  const size = new THREE.Vector3();
  box.getSize(size);
  const axis =
    size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";

  const min = box.min[axis];
  const max = box.max[axis];
  const cervical = min + (max - min) * 0.42;
  const blend = Math.max((max - min) * 0.1, 1e-6);

  const crown = new THREE.Color(0xffffff);
  const root = new THREE.Color(0xd2b48c);
  const positions = geo.attributes.position;
  const colors = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i += 1) {
    const coord = positions.getComponent(i, axis === "x" ? 0 : axis === "y" ? 1 : 2);
    const t = Math.max(0, Math.min(1, (coord - (cervical - blend)) / blend));
    const color = root.clone().lerp(crown, t);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  mesh.material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.38,
    metalness: 0.0,
  });
}

function applyOriginalTexture(mesh: THREE.Mesh, texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  mesh.material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.42,
    metalness: 0.0,
  });
}

export function ToothModel3D({ toothNumber }: ToothModel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const assets = getTooth3DAssets(toothNumber);
    const width = container.clientWidth;
    const height = 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0, 0.2, 2.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    const key = new THREE.DirectionalLight(0xfff5e6, 1.1);
    key.position.set(2, 3, 4);
    const fill = new THREE.DirectionalLight(0xc9daf8, 0.45);
    fill.position.set(-3, 1, -2);
    scene.add(ambient, key, fill);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new OBJLoader();
    let disposed = false;

    const mountModel = (obj: THREE.Group) => {
      if (disposed) return;
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      obj.position.sub(center);
      const scale = 1.6 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(scale);
      if (assets.mirrorX) obj.scale.x *= -1;
      group.add(obj);
    };

    const loadObj = (texture?: THREE.Texture) => {
      loader.load(
        assets.objUrl,
        (obj) => {
          if (disposed) return;
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (texture) {
                applyOriginalTexture(child, texture);
              } else {
                applyCrownRootColors(child);
              }
            }
          });
          mountModel(obj);
        },
        undefined,
        () => {
          if (disposed) return;
          const geo = new THREE.CapsuleGeometry(0.25, 0.8, 8, 16);
          const mesh = new THREE.Mesh(
            geo,
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38 }),
          );
          applyCrownRootColors(mesh);
          group.add(mesh);
        },
      );
    };

    if (assets.textureUrl) {
      new THREE.TextureLoader().load(
        assets.textureUrl,
        (texture) => loadObj(texture),
        undefined,
        () => loadObj(),
      );
    } else {
      loadObj();
    }

    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      group.rotation.y += (e.clientX - prevX) * 0.008;
      group.rotation.x += (e.clientY - prevY) * 0.005;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!dragging) group.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
    };
  }, [toothNumber]);

  return (
    <section className="tooth-3d no-print" aria-label="Modelo 3D interativo">
      <header className="tooth-3d__header">
        <span className="instruction-card__number">◉</span>
        <h2 className="tooth-3d__title">Visualizador 3D — arraste para girar</h2>
      </header>
      <div ref={containerRef} className="tooth-3d__canvas" />
    </section>
  );
}
