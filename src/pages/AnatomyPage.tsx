import { useState } from "react";
import { DentalArchScene, type ArchToothInfo } from "../components/DentalArchScene";

/**
 * Anatomia dental — experiência estilo BoneBox (fundo escuro + seleção de dente).
 */
export function AnatomyPage() {
  const [tooth, setTooth] = useState<ArchToothInfo | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const label = tooth
    ? `${tooth.fdi} — ${tooth.name}`
    : "Selecione um dente";

  return (
    <div className="anatomy-stage anatomy-stage--bonebox">
      <header className="anatomy-bonebox__brand" aria-label="GB Dental Anatomia">
        <p className="anatomy-bonebox__brand-mark">GB Dental</p>
        <h1 className="anatomy-bonebox__brand-title">Anatomia dental</h1>
      </header>

      <button
        type="button"
        className="anatomy-bonebox__help"
        aria-label="Ajuda"
        aria-expanded={helpOpen}
        onClick={() => setHelpOpen((v) => !v)}
      >
        ?
      </button>

      {helpOpen && (
        <div className="anatomy-bonebox__help-panel" role="dialog" aria-label="Ajuda">
          <p>Arraste para girar a arcada.</p>
          <p>Use o scroll (ou pinça) para aproximar.</p>
          <p>Toque em um dente para selecioná-lo.</p>
          <button type="button" onClick={() => setHelpOpen(false)}>
            Fechar
          </button>
        </div>
      )}

      <DentalArchScene
        selectedFdi={tooth?.fdi ?? null}
        onSelectTooth={setTooth}
      />

      <div className="anatomy-bonebox__bar">
        <p className={`anatomy-bonebox__select${tooth ? " is-active" : ""}`}>
          {label}
        </p>
        <button
          type="button"
          className="anatomy-bonebox__quiz"
          aria-label="Índice e quiz"
          title="Em breve: índice e quiz"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16.5 15.5l1.2 1.2 2.3-2.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
