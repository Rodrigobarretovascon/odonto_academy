import { Link, useParams } from "react-router-dom";
import { DentalSculpturePage } from "../components/DentalSculpturePage";
import { teeth, toothNavItems } from "../data/tooth-registry";

export function SculpturePage() {
  const { dente = "11" } = useParams();
  const key = teeth[dente] ? dente : "11";
  const data = teeth[key];

  return (
    <div className="sculpture-area">
      <nav className="sculpture-nav no-print" aria-label="Seleção de dente">
        <div className="sculpture-nav__groups">
          {(["upper", "lower"] as const).map((jaw) => (
            <div key={jaw} className="sculpture-nav__group">
              <span className="sculpture-nav__group-label">
                {jaw === "upper" ? "Superior" : "Inferior"}
              </span>
              <div className="sculpture-nav__links">
                {toothNavItems
                  .filter((t) => t.jaw === jaw)
                  .map((t) => (
                    <Link
                      key={t.key}
                      to={`/app/escultura/${t.key}`}
                      className={`sculpture-nav__link${t.key === key ? " sculpture-nav__link--active" : ""}`}
                      title={`${t.fullName} · FDI ${t.key}`}
                      aria-label={`${t.fullName}, número FDI ${t.key}`}
                    >
                      <span className="sculpture-nav__fdi">{t.key}</span>
                      <span className="sculpture-nav__name">{t.fullName}</span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
      <DentalSculpturePage data={data} />
    </div>
  );
}
