import { useEffect, useState } from "react";
import type { ToothSculptureData } from "../types/tooth";
import { teachingForAnyTooth } from "../data/phase-teaching";
import { resolvePhaseGuideImage } from "../data/phase-images";
import {
  isPosteriorTooth,
  workingFaceForPhase,
  workingFaceFromAnimPhase,
} from "../data/working-face";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface SculptureLessonPlayerProps {
  data: ToothSculptureData;
}

/**
 * Passo a passo em texto + uma imagem explicativa por etapa.
 * A face em trabalho fica sempre visível (selo + legenda).
 */
export function SculptureLessonPlayer({ data }: SculptureLessonPlayerProps) {
  const steps = data.steps;
  const total = steps.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [data.number]);

  if (!steps.length) {
    return (
      <section className="lesson-player lesson-player--text" aria-label="Passo a passo">
        <p className="lesson-player__empty">
          Ainda não há roteiro de texto para este dente.
        </p>
      </section>
    );
  }

  const step = steps[index];
  const go = (next: number) => setIndex(Math.max(0, Math.min(total - 1, next)));
  const teaching = teachingForAnyTooth(data.number, step.id);
  const face = teaching
    ? workingFaceForPhase(teaching, { isPosterior: isPosteriorTooth(data.number) })
    : workingFaceFromAnimPhase(step.animPhase as never);
  const resolved = resolvePhaseGuideImage(data.number, step.id);
  const image = resolved
    ? {
        src: resolved.src,
        alt: `${face.badge} — etapa ${step.id}: ${step.title} — dente ${data.number}`,
        placeholderLabel: `Imagem da etapa ${step.id} · dente ${data.number}`,
      }
    : {
        alt: `${face.badge} — etapa ${step.id}`,
        placeholderLabel: `Imagem da etapa ${step.id} · dente ${data.number}`,
      };

  return (
    <section className="lesson-player lesson-player--text" aria-label="Passo a passo da escultura">
      <header className="lesson-player__toolbar">
        <button
          type="button"
          className="lesson-player__nav-btn"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          ← Voltar
        </button>

        <div className="lesson-player__status">
          <p className="lesson-player__counter">
            Etapa {index + 1} de {total}
          </p>
          <p className="lesson-player__phase">{step.title}</p>
          <p className="lesson-player__face-inline" aria-live="polite">
            <span className="lesson-player__face-code">{face.code}</span>
            {face.name}
          </p>
        </div>

        <button
          type="button"
          className="lesson-player__nav-btn lesson-player__nav-btn--primary"
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
        >
          Avançar →
        </button>
      </header>

      <ol className="lesson-player__dots" aria-label="Navegação rápida entre etapas">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`lesson-player__dot${i === index ? " is-active" : ""}${i < index ? " is-done" : ""}`}
              onClick={() => go(i)}
              title={s.title}
              aria-current={i === index ? "step" : undefined}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>

      <article className="lesson-player__text lesson-player__text--full" id={`passo-${step.id}`}>
        <header className="lesson-player__text-head">
          <span className="lesson-player__badge">{step.id}</span>
          <h2 className="lesson-player__title">{step.title}</h2>
        </header>

        <div
          className={`lesson-player__face-banner lesson-player__face-banner--${face.code.toLowerCase()}`}
          role="status"
        >
          <span className="lesson-player__face-banner-label">Face em trabalho</span>
          <strong className="lesson-player__face-banner-value">
            {face.name}
            <span className="lesson-player__face-banner-code">({face.code})</span>
          </strong>
        </div>

        <div className="lesson-player__single-image">
          <div className="lesson-player__image-stage">
            <p className="lesson-player__face-seal" aria-hidden="true">
              {face.badge}
            </p>
            <ImagePlaceholder
              key={`${data.number}-${step.id}-${resolved?.format ?? "none"}`}
              image={image}
              variant="diagram"
              priority
            />
          </div>
          <p className="lesson-player__single-caption">
            {face.caption}
            {" · "}
            etapa {step.id}
            {" · "}
            FDI {data.number}
            {resolved?.format === "png" ? " · guia realista" : ""}
            {resolved?.fromTemplate
              ? ` · mesmo padrão do tipo (ref. ${resolved.tooth})`
              : ""}
            {!resolved ? " · imagem pendente" : ""}
          </p>
        </div>

        {teaching && (
          <dl className="lesson-player__meta">
            <div className="lesson-player__meta-face">
              <dt>Face / vista</dt>
              <dd>
                <strong>{face.name}</strong> ({face.code})
              </dd>
            </div>
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

        <p className="lesson-player__lead">Faça nesta ordem</p>
        <ol className="lesson-player__list">
          {step.instructions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>

        {step.alert && (
          <p className="lesson-player__alert" role="note">
            {step.alert}
          </p>
        )}
      </article>

      <footer className="lesson-player__footer-nav">
        <button
          type="button"
          className="lesson-player__nav-btn"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          ← Etapa anterior
        </button>
        <button
          type="button"
          className="lesson-player__nav-btn lesson-player__nav-btn--primary"
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
        >
          {index >= total - 1 ? "Concluído" : "Próxima etapa →"}
        </button>
      </footer>
    </section>
  );
}
