import { useNavigate } from "react-router-dom";
import type { ContralateralDifference } from "../types/tooth";

interface ContralateralComparisonProps {
  primaryNumber: number;
  primaryName: string;
  contralateralNumber: number;
  contralateralName: string;
  differences: ContralateralDifference[];
}

export function ContralateralComparison({
  primaryNumber,
  primaryName,
  contralateralNumber,
  contralateralName,
  differences,
}: ContralateralComparisonProps) {
  const navigate = useNavigate();
  const pair = [
    { num: primaryNumber, name: primaryName },
    { num: contralateralNumber, name: contralateralName },
  ];

  return (
    <section className="contralateral-comparison" aria-labelledby="contralateral-heading">
      <header className="contralateral-comparison__header">
        <span className="instruction-card__number">10</span>
        <h2 id="contralateral-heading" className="contralateral-comparison__title">
          Comparação com o dente contralateral
        </h2>
      </header>

      <div className="contralateral-comparison__picker">
        <label htmlFor="contralateral-select">Escolha o dente contralateral:</label>
        <select
          id="contralateral-select"
          value={primaryNumber}
          onChange={(e) => navigate(`/app/escultura/${e.target.value}`)}
          className="contralateral-select"
        >
          {pair.map((t) => (
            <option key={t.num} value={t.num}>
              {t.num} — {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="contralateral-comparison__intro">
        <div className="tooth-badge">
          <span className="tooth-badge__number">{primaryNumber}</span>
          <span className="tooth-badge__name">{primaryName}</span>
        </div>
        <span className="contralateral-comparison__vs" aria-hidden="true">
          ↔
        </span>
        <div className="tooth-badge tooth-badge--secondary">
          <span className="tooth-badge__number">{contralateralNumber}</span>
          <span className="tooth-badge__name">{contralateralName}</span>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col">Aspecto</th>
              <th scope="col">Dente {primaryNumber}</th>
              <th scope="col">Dente {contralateralNumber}</th>
            </tr>
          </thead>
          <tbody>
            {differences.map((row) => (
              <tr key={row.aspect}>
                <th scope="row">{row.aspect}</th>
                <td>{row.primaryTooth}</td>
                <td>{row.contralateralTooth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
