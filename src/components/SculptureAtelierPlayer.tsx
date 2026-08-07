import { useEffect, useId, useState } from "react";
import type { ToothSculptureData } from "../types/tooth";
import { teachingForAnyTooth } from "../data/phase-teaching";
import { resolvePhaseGuideImage } from "../data/phase-images";
import {
  isPosteriorTooth,
  workingFaceForPhase,
  workingFaceFromAnimPhase,
} from "../data/working-face";
import { SculptureOrbitStage } from "./SculptureOrbitStage";

interface SculptureAtelierPlayerProps {
  data: ToothSculptureData;
}

/**
 * Atelier do dente 11 — roteiro claro à esquerda, stage 3D orbitável à direita.
 */
export function SculptureAtelierPlayer({ data }: SculptureAtelierPlayerProps) {
  const steps = data.steps;
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [enterKey, setEnterKey] = useState(0);
  const titleId = useId();

  useEffect(() => {
    setIndex(0);
    setEnterKey((k) => k + 1);
  }, [data.number]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
        setEnterKey((k) => k + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
        setEnterKey((k) => k + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!steps.length) {
    return (
      <section className="atelier-player" aria-label="Passo a passo">
        <p className="atelier-player__empty">Ainda não há roteiro para este dente.</p>
      </section>
    );
  }

  const step = steps[index];
  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === index) return;
    setIndex(clamped);
    setEnterKey((k) => k + 1);
  };

  const teaching = teachingForAnyTooth(data.number, step.id);
  const face = teaching
    ? workingFaceForPhase(teaching, { isPosterior: isPosteriorTooth(data.number) })
    : workingFaceFromAnimPhase(step.animPhase as never);
  const resolved = resolvePhaseGuideImage(data.number, step.id);
  const progress = ((index + 1) / total) * 100;

  return (
    <section className="atelier-player" aria-labelledby={titleId}>
      <header className="atelier-player__chrome">
        <div className="atelier-player__chrome-text">
          <p className="atelier-player__eyebrow">Atelier de cera · FDI {data.number}</p>
          <h2 id={titleId} className="atelier-player__chrome-title">
            Escultura guiada
          </h2>
        </div>

        <div className="atelier-player__progress" aria-hidden="true">
          <span className="atelier-player__progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <p className="atelier-player__counter" aria-live="polite">
          Etapa <strong>{index + 1}</strong>
          <span aria-hidden="true"> / </span>
          <span className="sr-only">de </span>
          {total}
        </p>
      </header>

      <ol className="atelier-player__dots" aria-label="Navegação rápida entre etapas">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`atelier-player__dot${i === index ? " is-active" : ""}${i < index ? " is-done" : ""}`}
              onClick={() => go(i)}
              title={s.title}
              aria-current={i === index ? "step" : undefined}
            >
              <span className="atelier-player__dot-num">{i + 1}</span>
              <span className="atelier-player__dot-label">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div key={enterKey} className="atelier-player__split atelier-player__split--enter">
        <article className="atelier-player__script" id={`passo-${step.id}`}>
          <header className="atelier-player__script-head">
            <span className="atelier-player__badge" aria-hidden="true">
              {String(step.id).padStart(2, "0")}
            </span>
            <div>
              <p className="atelier-player__face-chip">
                <span>{face.code}</span>
                {face.name}
              </p>
              <h3 className="atelier-player__title">{step.title}</h3>
            </div>
          </header>

          {teaching && (
            <dl className="atelier-player__meta">
              <div>
                <dt>Ação</dt>
                <dd>{teaching.action}</dd>
              </div>
              <div>
                <dt>Instrumento</dt>
                <dd>{teaching.instrument}</dd>
              </div>
              <div>
                <dt className="is-remove">Remover</dt>
                <dd>{teaching.remove}</dd>
              </div>
              <div>
                <dt className="is-keep">Preservar</dt>
                <dd>{teaching.preserve}</dd>
              </div>
            </dl>
          )}

          <p className="atelier-player__lead">Faça nesta ordem</p>
          <ol className="atelier-player__list">
            {step.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          {step.alert && (
            <p className="atelier-player__alert" role="note">
              {step.alert}
            </p>
          )}

          {index === 0 && data.blockMeasures.length > 0 && (
            <ul className="atelier-player__measures" aria-label="Medidas do bloco">
              {data.blockMeasures.map((m) => (
                <li key={m.label}>
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <aside className="atelier-player__stage-col">
          <SculptureOrbitStage
            imageSrc={resolved?.src}
            alt={`${face.badge} — etapa ${step.id}: ${step.title} — dente ${data.number}`}
            stepId={step.id}
            toothNumber={data.number}
            faceBadge={face.badge}
            caption={
              resolved
                ? `${face.caption} · etapa ${step.id} · FDI ${data.number}${
                    resolved.fromTemplate ? ` · ref. ${resolved.tooth}` : ""
                  }`
                : `Slot 3D pronto · etapa ${step.id} · FDI ${data.number}`
            }
          />
        </aside>
      </div>

      <footer className="atelier-player__footer">
        <button
          type="button"
          className="atelier-player__nav-btn"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          ← Anterior
        </button>
        <button
          type="button"
          className="atelier-player__nav-btn atelier-player__nav-btn--primary"
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
        >
          {index >= total - 1 ? "Concluído" : "Próxima etapa →"}
        </button>
      </footer>
    </section>
  );
}
