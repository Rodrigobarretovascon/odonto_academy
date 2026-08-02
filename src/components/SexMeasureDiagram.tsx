import type { BlockMeasure } from "../types/tooth";

interface SexMeasureDiagramProps {
  measures: BlockMeasure[];
  toothNumber: number;
}

interface SexRow {
  label: string;
  male: string;
  female: string;
}

interface AnatomyBase {
  total: number;
  crown: number;
  vl: number;
  md: number;
}

function formatMm(n: number) {
  return `${n.toFixed(2).replace(".", ",")}mm`;
}

function rowsFromBase(base: AnatomyBase): SexRow[] {
  const { total, crown, vl, md } = base;
  return [
    { label: "Altura total", male: formatMm(total * 1.02), female: formatMm(total * 0.98) },
    { label: "Altura da coroa", male: formatMm(crown * 1.045), female: formatMm(crown * 0.955) },
    { label: "Dist. V/L máxima", male: formatMm(vl * 0.995), female: formatMm(vl * 1.005) },
    { label: "Dist. M/D Máxima", male: formatMm(md * 0.997), female: formatMm(md * 1.003) },
  ];
}

/** Medidas anatômicas de referência por FDI (média), usadas para ♂/♀. */
const ANATOMY: Record<number, AnatomyBase> = {
  11: { total: 23.47, crown: 10.54, vl: 7.0, md: 8.345 },
  12: { total: 22.0, crown: 9.0, vl: 6.0, md: 6.5 },
  13: { total: 27.0, crown: 10.5, vl: 8.4, md: 7.9 },
  14: { total: 22.5, crown: 8.5, vl: 9.0, md: 7.0 },
  15: { total: 21.5, crown: 8.0, vl: 8.5, md: 7.0 },
  16: { total: 20.5, crown: 7.5, vl: 11.0, md: 10.5 },
  17: { total: 19.5, crown: 7.0, vl: 10.0, md: 10.0 },
  21: { total: 23.47, crown: 10.54, vl: 7.0, md: 8.345 },
  22: { total: 22.0, crown: 9.0, vl: 6.0, md: 6.5 },
  23: { total: 27.0, crown: 10.5, vl: 8.4, md: 7.9 },
  24: { total: 22.5, crown: 8.5, vl: 9.0, md: 7.0 },
  25: { total: 21.5, crown: 8.0, vl: 8.5, md: 7.0 },
  26: { total: 20.5, crown: 7.5, vl: 11.0, md: 10.5 },
  27: { total: 19.5, crown: 7.0, vl: 10.0, md: 10.0 },
  31: { total: 21.0, crown: 9.0, vl: 6.0, md: 5.4 },
  32: { total: 22.0, crown: 9.5, vl: 6.0, md: 6.0 },
  33: { total: 25.5, crown: 11.0, vl: 8.0, md: 7.0 },
  34: { total: 22.5, crown: 8.5, vl: 9.0, md: 7.0 },
  35: { total: 21.5, crown: 8.0, vl: 8.5, md: 7.0 },
  36: { total: 21.0, crown: 7.5, vl: 10.5, md: 11.0 },
  37: { total: 20.0, crown: 7.0, vl: 10.0, md: 10.0 },
  41: { total: 21.0, crown: 9.0, vl: 6.0, md: 5.4 },
  42: { total: 22.0, crown: 9.5, vl: 6.0, md: 6.0 },
  43: { total: 25.5, crown: 11.0, vl: 8.0, md: 7.0 },
  44: { total: 22.5, crown: 8.5, vl: 9.0, md: 7.0 },
  45: { total: 21.5, crown: 8.0, vl: 8.5, md: 7.0 },
  46: { total: 21.0, crown: 7.5, vl: 10.5, md: 11.0 },
  47: { total: 20.0, crown: 7.0, vl: 10.0, md: 10.0 },
};

/** Valores exatos do material de referência (incisivo central superior). */
const EXACT: Partial<Record<number, SexRow[]>> = {
  11: [
    { label: "Altura total", male: "23,92mm", female: "23,02mm" },
    { label: "Altura da coroa", male: "11,00mm", female: "10,08mm" },
    { label: "Dist. V/L máxima", male: "6,97mm", female: "7,04mm" },
    { label: "Dist. M/D Máxima", male: "8,32mm", female: "8,37mm" },
  ],
  21: [
    { label: "Altura total", male: "23,92mm", female: "23,02mm" },
    { label: "Altura da coroa", male: "11,00mm", female: "10,08mm" },
    { label: "Dist. V/L máxima", male: "6,97mm", female: "7,04mm" },
    { label: "Dist. M/D Máxima", male: "8,32mm", female: "8,37mm" },
  ],
};

function rowsForTooth(toothNumber: number): SexRow[] {
  if (EXACT[toothNumber]) return EXACT[toothNumber]!;
  const base = ANATOMY[toothNumber];
  if (base) return rowsFromBase(base);
  return rowsFromBase({ total: 22, crown: 10, vl: 7, md: 8 });
}

export function SexMeasureDiagram({ toothNumber }: SexMeasureDiagramProps) {
  const rows = rowsForTooth(toothNumber);

  return (
    <figure className="sex-measure">
      <table className="sex-measure__table">
        <caption className="sex-measure__caption">Medidas anatômicas · FDI {toothNumber}</caption>
        <thead>
          <tr>
            <th scope="col" className="sex-measure__th-label">
              Medida
            </th>
            <th scope="col" className="sex-measure__th-male">
              <span className="sex-measure__sex-icon" aria-hidden="true">
                ♂
              </span>
              Masculino
            </th>
            <th scope="col" className="sex-measure__th-female">
              <span className="sex-measure__sex-icon" aria-hidden="true">
                ♀
              </span>
              Feminino
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className="sex-measure__td-male">{row.male}</td>
              <td className="sex-measure__td-female">{row.female}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
