import { useState } from "react";
import { FINAL_QUIZ } from "../data/finalQuiz";

export function FinalQuizPanel({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const item = FINAL_QUIZ[idx];

  const answer = (id: string) => {
    if (picked) return;
    setPicked(id);
    if (id === item.correctId) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx >= FINAL_QUIZ.length - 1) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  if (done) {
    return (
      <section className="immersive-panel" aria-label="Teste final">
        <h2>Teste final do dente</h2>
        <p>
          Você acertou <strong>{score}</strong> de {FINAL_QUIZ.length} questões.
        </p>
        <p className="immersive-panel__lead">
          Avaliação didática — não é nota clínica. Revise as fases se algum conceito ficou incerto.
        </p>
        <button type="button" className="immersive-lesson__primary-btn" onClick={onClose}>
          Voltar
        </button>
      </section>
    );
  }

  return (
    <section className="immersive-panel" aria-label="Teste final">
      <h2>
        Teste final · {idx + 1}/{FINAL_QUIZ.length}
      </h2>
      <p className="immersive-panel__lead">{item.prompt}</p>
      <div className="immersive-tools">
        {item.choices.map((c) => {
          const correct = picked && c.id === item.correctId;
          const wrong = picked === c.id && c.id !== item.correctId;
          return (
            <button
              key={c.id}
              type="button"
              className={`immersive-tool${correct ? " is-active" : ""}${wrong ? " is-wrong" : ""}`}
              onClick={() => answer(c.id)}
            >
              <strong>{c.label}</strong>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="immersive-explore__detail">
          <p>{item.explanation}</p>
          <button type="button" className="immersive-lesson__primary-btn" onClick={next}>
            {idx >= FINAL_QUIZ.length - 1 ? "Ver resultado" : "Próxima"}
          </button>
        </div>
      )}
      <button type="button" className="immersive-lesson__ghost-btn" onClick={onClose}>
        Sair do teste
      </button>
    </section>
  );
}
