import { useState } from "react";
import { ToothModel3D } from "../components/ToothModel3D";
import { teeth, toothOrder } from "../data/tooth-registry";

export function Viewer3DPage() {
  const [selected, setSelected] = useState("13");
  const data = teeth[selected] ?? teeth["13"];

  return (
    <div className="viewer3d-page">
      <header className="viewer3d-page__header">
        <h1>Visualizador 3D</h1>
        <p>
          Modele, gire e aproxime o dente selecionado. Controles por mouse ou toque. Modelos:
          University of Dundee (CC BY).
        </p>
      </header>

      <div className="viewer3d-page__layout">
        <aside className="viewer3d-page__picker" aria-label="Seleção de dente">
          <label>
            Dente (FDI)
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {toothOrder.map((n) => (
                <option key={n} value={n}>
                  {n} — {teeth[n]?.name}
                </option>
              ))}
            </select>
          </label>
          <div className="viewer3d-page__identity">
            <strong>{data.number}</strong>
            <span>{data.name}</span>
          </div>
        </aside>
        <div className="viewer3d-page__stage">
          <ToothModel3D toothNumber={data.number} />
        </div>
      </div>
    </div>
  );
}
