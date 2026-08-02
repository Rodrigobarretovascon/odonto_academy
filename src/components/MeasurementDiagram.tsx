import type { BlockMeasure, ToothImage } from "../types/tooth";
import { SexMeasureDiagram } from "./SexMeasureDiagram";

interface MeasurementDiagramProps {
  measures: BlockMeasure[];
  preparation: string[];
  blockImage?: ToothImage;
  toothNumber: number;
}

export function MeasurementDiagram({
  measures,
  preparation,
  toothNumber,
}: MeasurementDiagramProps) {
  return (
    <section className="measurement-diagram" aria-labelledby="measures-heading">
      <header className="measurement-diagram__header">
        <span className="instruction-card__number">1</span>
        <h2 id="measures-heading" className="measurement-diagram__title">
          Marcar a cera — medidas e preparação
        </h2>
      </header>

      <div className="measurement-diagram__grid">
        <div className="measurement-diagram__block">
          <h3 className="measurement-diagram__subtitle">Dimensões do bloco</h3>
          <dl className="measure-table">
            {measures.map((m) => (
              <div key={m.label} className="measure-table__row">
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="measurement-diagram__block">
          <h3 className="measurement-diagram__subtitle">Preparação</h3>
          <ul className="measurement-diagram__list">
            {preparation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="measurement-diagram__diagram">
          <SexMeasureDiagram measures={measures} toothNumber={toothNumber} />
        </div>
      </div>
    </section>
  );
}
