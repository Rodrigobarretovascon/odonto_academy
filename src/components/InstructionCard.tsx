import { useState } from "react";
import type { SculptureStep } from "../types/tooth";
import { phaseVideoPath } from "../data/tooth-registry";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SculptureStepVisual } from "./SculptureStepVisual";
import { WaxStepAnimation } from "./WaxStepAnimation";

interface InstructionCardProps {
  step: SculptureStep;
  compact?: boolean;
  toothNumber?: number;
}

export function InstructionCard({ step, compact = false, toothNumber }: InstructionCardProps) {
  const [show3d, setShow3d] = useState(false);
  const [preferFileVideo, setPreferFileVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const expectedVideo =
    step.video ?? (toothNumber != null ? phaseVideoPath(toothNumber, step.id) : undefined);
  const phase = step.animPhase ?? "rough-cut";

  return (
    <article
      id={`passo-${step.id}`}
      className={`instruction-card instruction-card--guided ${compact ? "instruction-card--compact" : ""}`}
    >
      <header className="instruction-card__header">
        <span className="instruction-card__number" aria-hidden="true">
          {step.id}
        </span>
        <h3 className="instruction-card__title">{step.title}</h3>
      </header>

      <div className="instruction-card__body instruction-card__body--split">
        {toothNumber != null && (
          <SculptureStepVisual
            phase={phase}
            toothNumber={toothNumber}
            stepTitle={step.title}
            stepId={step.id}
          />
        )}

        <div className="instruction-card__copy">
          <p className="instruction-card__lead">Faça nesta ordem:</p>
          <ol className="instruction-card__list instruction-card__list--ordered">
            {step.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          {step.alert && (
            <p className="instruction-card__alert" role="note">
              {step.alert}
            </p>
          )}

          {step.image && (
            <ImagePlaceholder
              image={step.image}
              variant="step"
              className="instruction-card__image"
            />
          )}

          {toothNumber != null && (
            <div className="instruction-card__extra">
              {preferFileVideo && expectedVideo && videoReady ? (
                <video
                  className="instruction-card__video-player"
                  controls
                  preload="metadata"
                  playsInline
                  onError={() => {
                    setVideoReady(false);
                    setPreferFileVideo(false);
                  }}
                >
                  <source src={expectedVideo} type="video/mp4" />
                </video>
              ) : (
                <>
                  <button
                    type="button"
                    className="instruction-card__3d-toggle"
                    aria-expanded={show3d}
                    onClick={() => setShow3d((v) => !v)}
                  >
                    {show3d ? "Ocultar animação 3D" : "Ver também em 3D (bloco → dente)"}
                  </button>
                  {show3d && (
                    <WaxStepAnimation
                      toothNumber={toothNumber}
                      stepId={step.id}
                      stepTitle={step.title}
                      animPhase={phase}
                      instructions={step.instructions}
                    />
                  )}
                </>
              )}

              {expectedVideo && (
                <video
                  className="visually-hidden"
                  preload="metadata"
                  onLoadedData={() => {
                    setVideoReady(true);
                    setPreferFileVideo(true);
                  }}
                  onError={() => setVideoReady(false)}
                >
                  <source src={expectedVideo} type="video/mp4" />
                </video>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
