import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DENTAL_QUESTIONS,
  QUESTION_CATEGORY_LABEL,
  type QuestionCategory,
} from "../data/questions";

export function QuestionsPage() {
  const { hasAccess, user } = useAuth();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<QuestionCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(DENTAL_QUESTIONS[0]?.id ?? null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DENTAL_QUESTIONS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!term) return true;
      return (
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [q, category]);

  return (
    <div className="content-page questions-page">
      <h1>Perguntas odontológicas</h1>
      <p className="content-page__lead">
        Perguntas e respostas para estudar. Conteúdos marcados como exclusivos pedem assinatura.
      </p>

      <div className="questions-toolbar">
        <label>
          Buscar
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex.: ligamento, molar, 21…"
            aria-label="Buscar perguntas"
          />
        </label>
        <label>
          Categoria
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as QuestionCategory | "all")}
          >
            <option value="all">Todas</option>
            {(Object.keys(QUESTION_CATEGORY_LABEL) as QuestionCategory[]).map((c) => (
              <option key={c} value={c}>
                {QUESTION_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="questions-list">
        {filtered.map((item) => {
          const locked = Boolean(item.subscriberOnly) && !hasAccess && user?.role !== "admin";
          const isOpen = openId === item.id;
          return (
            <article key={item.id} className="questions-item">
              <button
                type="button"
                className="questions-item__q"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.question}</span>
                <small>{QUESTION_CATEGORY_LABEL[item.category]}</small>
              </button>
              {isOpen && (
                <div className="questions-item__a">
                  {locked ? (
                    <p>
                      Resposta completa para assinantes.{" "}
                      <Link to="/assinar">Assinar para ver</Link>
                    </p>
                  ) : (
                    <p>{item.answer}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="admin-muted">Nenhuma pergunta encontrada para essa busca.</p>
        )}
      </div>
    </div>
  );
}
