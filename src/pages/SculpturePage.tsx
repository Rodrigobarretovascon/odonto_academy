import { Link, useParams } from "react-router-dom";
import { DentalSculpturePage } from "../components/DentalSculpturePage";
import { teeth, toothNavItems } from "../data/tooth-registry";

const HEMIROWS = [
  { group: "upper-r" as const, label: "Superior" },
  { group: "lower-r" as const, label: "Inferior" },
];

export function SculpturePage() {
  const { dente = "11" } = useParams();
  const key = teeth[dente] ? dente : "11";
  const data = teeth[key];

  return (
    <div className="sculpture-area">
      <nav className="sculpture-nav no-print" aria-label="Hemiarcada direita">
        <div className="sculpture-nav__groups">
          {HEMIROWS.map((row) => (
            <div key={row.group} className="sculpture-nav__group">
              <span className="sculpture-nav__group-label">{row.label}</span>
              <div className="sculpture-nav__links">
                {toothNavItems
                  .filter((t) => t.group === row.group)
                  .map((t) => (
                    <Link
                      key={t.key}
                      to={`/app/escultura/${t.key}`}
                      className={`sculpture-nav__link${t.key === key ? " sculpture-nav__link--active" : ""}`}
                      title={`${t.fullName} · FDI ${t.key}`}
                      aria-label={`${t.fullName}, número FDI ${t.key}`}
                    >
                      <span className="sculpture-nav__fdi">{t.key}</span>
                      <span className="sculpture-nav__name">{t.shortName}</span>
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
