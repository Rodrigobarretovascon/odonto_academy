import { useMemo, useState } from "react";
import {
  DENTAL_QUESTIONS,
  QUESTION_CATEGORY_LABEL,
  type QuestionCategory,
} from "../data/questions";
import { PageShell } from "../components/PageShell";

export function QuestionsPage() {
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
    <PageShell
      eyebrow="GB Dental · Assinantes"
      title="Perguntas odontológicas"
      lead="Perguntas e respostas exclusivas da assinatura para estudar com método."
    >
      <div className="page-card page-card--wide">
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
            const open = openId === item.id;
            return (
              <article key={item.id} className={`questions-item${open ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="questions-item__q"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <span>{item.question}</span>
                  <small>{QUESTION_CATEGORY_LABEL[item.category]}</small>
                </button>
                {open && (
                  <div className="questions-item__a">
                    <p>{item.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
          {filtered.length === 0 && <p className="admin-muted">Nenhuma pergunta encontrada.</p>}
        </div>
      </div>
    </PageShell>
  );
}
