import type { ToothSculptureData } from "../types/tooth";
import { ContralateralComparison } from "./ContralateralComparison";
import { InstructionCard } from "./InstructionCard";
import { MeasurementDiagram } from "./MeasurementDiagram";
import { ToothModel3D } from "./ToothModel3D";
import { ToothView } from "./ToothView";

interface DentalSculpturePageProps {
  data: ToothSculptureData;
}

function handlePrint() {
  window.print();
}

export function DentalSculpturePage({ data }: DentalSculpturePageProps) {
  return (
    <div className="dental-page">
      <header className="dental-page__toolbar no-print">
        <button type="button" className="btn-print" onClick={handlePrint}>
          Exportar PDF / Imprimir
        </button>
      </header>

      <main className="dental-page__slide">
        <section className="dental-page__hero">
          <div className="dental-page__hero-text">
            <p className="dental-page__eyebrow">Escultura dental em cera</p>
            <h1 className="dental-page__title">{data.title}</h1>
            {data.subtitle && <p className="dental-page__subtitle">{data.subtitle}</p>}
          </div>
          <div className="dental-page__hero-meta">
            <div className="tooth-badge tooth-badge--large">
              <span className="tooth-badge__number">{data.number}</span>
              <span className="tooth-badge__name">{data.name}</span>
            </div>
          </div>
        </section>

        {data.alerts.length > 0 && (
          <aside className="dental-page__alerts" role="note">
            <strong>Atenção:</strong>
            <ul>
              {data.alerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </aside>
        )}

        <ToothModel3D toothNumber={data.number} />

        <div className="dental-page__grid">
          <MeasurementDiagram
            measures={data.blockMeasures}
            preparation={data.blockPreparation}
            blockImage={data.blockImage}
          />

          <InstructionCard step={data.faceIdentification} compact />

          {data.steps.map((step) => (
            <InstructionCard key={step.id} step={step} compact />
          ))}

          <ToothView views={data.finalViews} />

          <ContralateralComparison
            primaryNumber={data.number}
            primaryName={data.name}
            contralateralNumber={data.contralateralNumber}
            contralateralName={data.contralateralName}
            differences={data.contralateralDifferences}
          />
        </div>

        <footer className="dental-page__footer">
          <p>
            Dente {data.number} · Par contralateral {data.contralateralNumber}
          </p>
        </footer>
      </main>
    </div>
  );
}
