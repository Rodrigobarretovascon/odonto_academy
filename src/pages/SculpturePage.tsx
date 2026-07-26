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
          {(["upper-r", "upper-l", "lower-l", "lower-r"] as const).map((group) => (
            <div key={group} className="sculpture-nav__group">
              <span className="sculpture-nav__group-label">
                {group === "upper-r" && "Sup. Dir."}
                {group === "upper-l" && "Sup. Esq."}
                {group === "lower-l" && "Inf. Esq."}
                {group === "lower-r" && "Inf. Dir."}
              </span>
              <div className="sculpture-nav__links">
                {toothNavItems
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <Link
                      key={t.key}
                      to={`/app/escultura/${t.key}`}
                      className={`sculpture-nav__link${t.key === key ? " sculpture-nav__link--active" : ""}`}
                      title={`${t.key} — ${t.fullName}`}
                    >
                      {t.shortName}
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
