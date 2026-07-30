import { Link } from "react-router-dom";
import type { ToothSculptureData } from "../types/tooth";
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
        <Link
          to={`/app/escultura/${data.contralateralNumber}`}
          className="btn-outline"
          title={`Abrir contralateral FDI ${data.contralateralNumber}`}
        >
          Contralateral {data.contralateralNumber} — {data.contralateralName}
        </Link>
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

        <div className="dental-page__grid">
          <MeasurementDiagram
            measures={data.blockMeasures}
            preparation={data.blockPreparation}
            blockImage={data.blockImage}
          />

          <InstructionCard
            step={data.faceIdentification}
            compact
            toothNumber={data.number}
          />

          {data.steps.map((step) => (
            <InstructionCard key={step.id} step={step} compact toothNumber={data.number} />
          ))}

          <ToothView views={data.finalViews} />

          <section className="dental-page__final-3d" aria-labelledby="final-3d-heading">
            <h2 id="final-3d-heading">Resultado final — gire o dente</h2>
            <p>Arraste para rotacionar em todos os ângulos. Modelos interativos gerais ficam no Visualizador 3D.</p>
            <ToothModel3D toothNumber={data.number} />
          </section>
        </div>

        <footer className="dental-page__footer">
          <p>
            {data.name} · FDI {data.number}
          </p>
          <p className="content-page__note">
            Conteúdo educacional — revisão por profissional de odontologia pendente para uso clínico definitivo.
          </p>
        </footer>
      </main>
    </div>
  );
}
