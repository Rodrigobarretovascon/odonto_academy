import { useState } from "react";
import type { SculptureStep } from "../types/tooth";
import { phaseVideoPath } from "../data/tooth-registry";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { PageEmptyError } from "./ToothMascot";

interface InstructionCardProps {
  step: SculptureStep;
  compact?: boolean;
  toothNumber?: number;
}

export function InstructionCard({ step, compact = false, toothNumber }: InstructionCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const expectedVideo =
    step.video ?? (toothNumber != null ? phaseVideoPath(toothNumber, step.id) : undefined);

  return (
    <article className={`instruction-card ${compact ? "instruction-card--compact" : ""}`}>
      <header className="instruction-card__header">
        <button
          type="button"
          className="instruction-card__number instruction-card__number--btn"
          aria-label={`Abrir vídeo da fase ${step.id}`}
          onClick={() => {
            setVideoFailed(false);
            setVideoOpen(true);
          }}
        >
          {step.id}
        </button>
        <h3 className="instruction-card__title">{step.title}</h3>
      </header>

      <div className="instruction-card__body">
        <ul className="instruction-card__list">
          {step.instructions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {step.image && (
          <ImagePlaceholder
            image={step.image}
            variant="step"
            className="instruction-card__image"
          />
        )}
      </div>

      {step.alert && (
        <p className="instruction-card__alert" role="note">
          {step.alert}
        </p>
      )}

      {videoOpen && (
        <div className="phase-video-modal" role="dialog" aria-modal="true" aria-label={`Vídeo fase ${step.id}`}>
          <button
            type="button"
            className="phase-video-modal__backdrop"
            aria-label="Fechar"
            onClick={() => setVideoOpen(false)}
          />
          <div className="phase-video-modal__panel">
            <button type="button" className="phase-video-modal__close" onClick={() => setVideoOpen(false)}>
              Fechar
            </button>
            <h4>
              Fase {step.id}: {step.title}
            </h4>
            {!videoFailed && expectedVideo ? (
              <video
                className="phase-video-modal__video"
                controls
                preload="metadata"
                onError={() => setVideoFailed(true)}
              >
                <source src={expectedVideo} type="video/mp4" />
              </video>
            ) : (
              <PageEmptyError
                title="Vídeo ainda não disponível"
                message={`Arquivo necessário: ${expectedVideo ?? "vídeo da fase"} — não reutilize mídia de outro dente.`}
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
}
