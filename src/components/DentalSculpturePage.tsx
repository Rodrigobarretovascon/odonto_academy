import { Link } from "react-router-dom";
import type { ToothSculptureData } from "../types/tooth";
import { MeasurementDiagram } from "./MeasurementDiagram";
import { SculptureAtelierPlayer } from "./SculptureAtelierPlayer";
import { SculptureLessonPlayer } from "./SculptureLessonPlayer";

interface DentalSculpturePageProps {
  data: ToothSculptureData;
}

function isRightHemi(n: number) {
  return (n >= 11 && n <= 17) || (n >= 41 && n <= 47);
}

/**
 * Página de escultura — atelier no FDI 11; player clássico nos demais.
 */
export function DentalSculpturePage({ data }: DentalSculpturePageProps) {
  const isAtelier = data.number === 11;
  const primary = isRightHemi(data.number)
    ? { number: data.number, name: data.name }
    : { number: data.contralateralNumber, name: data.contralateralName };
  const secondary = isRightHemi(data.number)
    ? { number: data.contralateralNumber, name: data.contralateralName }
    : { number: data.number, name: data.name };

  return (
    <div className={`dental-page${isAtelier ? " dental-page--atelier" : ""}`}>
      <main className="dental-page__slide">
        <section className={`dental-page__hero${isAtelier ? " dental-page__hero--atelier" : ""}`}>
          <div className="dental-page__hero-copy">
            {isAtelier && <p className="dental-page__eyebrow">Escultura em cera</p>}
            <h1 className="dental-page__title">{data.name}</h1>
            {isAtelier && (
              <p className="dental-page__subtitle">
                Seis etapas do vídeo — claras, resumidas, com espaço para a imagem 3D de cada fase.
              </p>
            )}
          </div>
          <div className="tooth-id-stack">
            <Link
              to={`/app/escultura/${primary.number}`}
              className={`tooth-id-card tooth-id-card--link${
                data.number === primary.number ? " tooth-id-card--active" : ""
              }`}
              aria-current={data.number === primary.number ? "page" : undefined}
              aria-label={`Esculpir dente FDI ${primary.number}: ${primary.name}`}
            >
              <span className="tooth-id-card__number">{primary.number}</span>
              <span className="tooth-id-card__name">{primary.name}</span>
            </Link>
            <Link
              to={`/app/escultura/${secondary.number}`}
              className={`tooth-id-card tooth-id-card--link${
                data.number === secondary.number ? " tooth-id-card--active" : ""
              }`}
              aria-current={data.number === secondary.number ? "page" : undefined}
              aria-label={`Esculpir dente FDI ${secondary.number}: ${secondary.name}`}
            >
              <span className="tooth-id-card__number">{secondary.number}</span>
              <span className="tooth-id-card__name">{secondary.name}</span>
            </Link>
          </div>
        </section>

        {!isAtelier && (
          <MeasurementDiagram
            measures={data.blockMeasures}
            preparation={data.blockPreparation}
            blockImage={data.blockImage}
            toothNumber={data.number}
          />
        )}

        {isAtelier ? <SculptureAtelierPlayer data={data} /> : <SculptureLessonPlayer data={data} />}

        <footer className="dental-page__footer">
          <p>
            {data.name} · FDI {data.number}
          </p>
          <p className="content-page__note">
            {isAtelier
              ? "Roteiro do vídeo didático. Imagem 3D por etapa será vinculada ao admin."
              : "Roteiro em texto. Conteúdo sujeito a revisão profissional."}
          </p>
        </footer>
      </main>
    </div>
  );
}
