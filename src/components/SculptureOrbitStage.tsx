import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface SculptureOrbitStageProps {
  /** URL da imagem da etapa (fase atual ou futura do admin). */
  imageSrc?: string;
  alt: string;
  stepId: number;
  toothNumber: number;
  faceBadge: string;
  caption?: string;
}

/**
 * Stage 3D orbitável para a etapa de escultura.
 * Auto-rotação com pausa no hover/arraste; aceita imagem da fase
 * (hoje via assets locais; depois via CRUD admin).
 */
export function SculptureOrbitStage({
  imageSrc,
  alt,
  stepId,
  toothNumber,
  faceBadge,
  caption,
}: SculptureOrbitStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const yawRef = useRef(18);
  const pitchRef = useRef(-8);
  const rafRef = useRef(0);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });
  const [broken, setBroken] = useState(false);
  const [yaw, setYaw] = useState(18);
  const [pitch, setPitch] = useState(-8);

  useEffect(() => {
    setBroken(false);
  }, [imageSrc, stepId]);

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;

      if (!draggingRef.current && !pausedRef.current) {
        yawRef.current = (yawRef.current + dt * 0.018) % 360;
        setYaw(yawRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    pausedRef.current = true;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    yawRef.current = (yawRef.current + dx * 0.45) % 360;
    pitchRef.current = Math.max(-28, Math.min(18, pitchRef.current - dy * 0.28));
    setYaw(yawRef.current);
    setPitch(pitchRef.current);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const showImage = Boolean(imageSrc) && !broken;

  return (
    <div
      className="orbit-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
      }}
      role="img"
      aria-label={alt}
    >
      <div className="orbit-stage__glow" aria-hidden="true" />
      <p className="orbit-stage__face-seal">{faceBadge}</p>

      <div className="orbit-stage__scene" aria-hidden={!showImage}>
        <div
          className="orbit-stage__rig"
          style={{
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)`,
          }}
        >
          <div className="orbit-stage__pedestal">
            <span className="orbit-stage__pedestal-ring" />
            <span className="orbit-stage__pedestal-disc" />
          </div>

          <div className={`orbit-stage__subject${showImage ? "" : " orbit-stage__subject--empty"}`}>
            {showImage ? (
              <img
                key={imageSrc}
                src={imageSrc}
                alt=""
                className="orbit-stage__image"
                draggable={false}
                onError={() => setBroken(true)}
              />
            ) : (
              <div className="orbit-stage__placeholder">
                <span className="orbit-stage__placeholder-mark" aria-hidden="true">
                  3D
                </span>
                <span className="orbit-stage__placeholder-title">Imagem 3D da etapa</span>
                <span className="orbit-stage__placeholder-sub">
                  FDI {toothNumber} · etapa {stepId}
                  <br />
                  Em breve — via área admin
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="orbit-stage__floor" aria-hidden="true" />

      <p className="orbit-stage__hint">Arraste para orbitar · rotação automática</p>
      {caption ? <p className="orbit-stage__caption">{caption}</p> : null}
    </div>
  );
}
