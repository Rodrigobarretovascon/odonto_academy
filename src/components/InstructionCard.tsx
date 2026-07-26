import type { SculptureStep } from "../types/tooth";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface InstructionCardProps {
  step: SculptureStep;
  compact?: boolean;
}

export function InstructionCard({ step, compact = false }: InstructionCardProps) {
  return (
    <article className={`instruction-card ${compact ? "instruction-card--compact" : ""}`}>
      <header className="instruction-card__header">
        <span className="instruction-card__number">{step.id}</span>
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
    </article>
  );
}
