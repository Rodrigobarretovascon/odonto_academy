import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { AiMascot } from "../components/AiMascot";
import { toothOrder, teeth } from "../data/tooth-registry";

interface Message {
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
}

const WELCOME =
  "Olá! Eu sou o Odus, assistente do GB Dental. Pergunte direto — busco fontes, filtro e respondo com linguagem odontológica. Também gero ilustrações educacionais (ex.: “gere uma imagem da oclusal do 16”). Não substituo professor ou dentista.";

const TOPICS: { label: string; prompt: string }[] = [
  { label: "Anatomia", prompt: "Explique a anatomia das faces do dente e a nomenclatura FDI." },
  { label: "Dentística", prompt: "O que é dentística restauradora e quais materiais mais usados?" },
  { label: "Endodontia", prompt: "Como funciona o tratamento de canal, passo a passo educacional?" },
  { label: "Periodontia", prompt: "O que diferencia gengivite de periodontite?" },
  { label: "Prótese", prompt: "Quais tipos de prótese odontológica existem e quando indicar?" },
  { label: "Implantes", prompt: "O que é osseointegração de implante?" },
  { label: "Ortodontia", prompt: "Quais são as classes de Angle na ortodontia?" },
  { label: "Cirurgia", prompt: "Quais cuidados gerais em exodontia de terceiro molar?" },
  { label: "Radiologia", prompt: "Quando indicar uma radiografia periapical?" },
  { label: "Oclusão", prompt: "Explique guia canina e contatos oclusais estáveis." },
  { label: "Prevenção", prompt: "Como prevenir cárie no dia a dia?" },
  { label: "Escultura", prompt: "O que é a técnica regressiva de escultura em cera?" },
];

const GENERAL_STARTERS = [
  "O que diferencia gengivite de periodontite?",
  "Como funciona o tratamento de canal?",
  "Quais são as classes de Angle na ortodontia?",
  "Gere uma imagem da anatomia oclusal de um molar",
  "O que é osseointegração de implante?",
  "Como prevenir cárie no dia a dia?",
];

function startersForTooth(n: string): string[] {
  if (!n) return GENERAL_STARTERS;
  const tooth = teeth[n];
  const kind = tooth?.steps.some((s) => s.animPhase === "occlusal")
    ? "posterior"
    : "anterior";
  const shared = [
    `Qual a anatomia do dente ${n}?`,
    "O que diferencia gengivite de periodontite?",
    "Como funciona o tratamento de canal?",
  ];
  if (kind === "posterior") {
    return [
      `Gere uma imagem da oclusal do dente ${n}`,
      `Como esculpir os sulcos oclusais do dente ${n}?`,
      ...shared,
    ];
  }
  return [
    `Gere uma imagem da anatomia do dente ${n}`,
    `Quais detalhes anatômicos do dente ${n}?`,
    ...shared,
  ];
}

export function AiChatPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooth, setTooth] = useState("");
  const [engine, setEngine] = useState<"openai" | "local" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const toothMeta = tooth ? teeth[tooth] : undefined;
  const suggestions = useMemo(() => startersForTooth(tooth), [tooth]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messagesRef.current
      .filter((m) => m.text !== WELCOME)
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const data = await api<{
        reply: string;
        engine?: "openai" | "local";
        imageUrl?: string | null;
      }>(
        "/ai/chat",
        {
          method: "POST",
          body: JSON.stringify({
            message: trimmed,
            toothNumber: tooth || undefined,
            history,
          }),
        },
        token,
      );
      if (data.engine === "openai" || data.engine === "local") {
        setEngine(data.engine);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.reply,
          imageUrl: data.imageUrl || undefined,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Não foi possível responder agora. Confira sua conexão e tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", text: WELCOME }]);
    setInput("");
    setEngine(null);
    inputRef.current?.focus();
  };

  return (
    <div className="ai-page">
      <header className="ai-page__header">
        <div className="ai-page__hero">
          <div className="ai-page__mascot-stage" aria-hidden="true">
            <AiMascot size={112} className="ai-page__mascot" />
          </div>
          <div className="ai-page__intro">
            <p className="ai-page__eyebrow">GB Dental</p>
            <h1>Odus</h1>
            <p className="ai-page__tagline">Seu fantasminha da odontologia</p>
          </div>
        </div>
      </header>

      <div className="ai-layout">
        <aside className="ai-sidebar" aria-label="Contexto e sugestões">
          <label className="ai-sidebar__field">
            <span>Contexto (opcional)</span>
            <select value={tooth} onChange={(e) => setTooth(e.target.value)}>
              <option value="">Odontologia geral</option>
              {toothOrder.map((n) => {
                const t = teeth[n];
                return (
                  <option key={n} value={n}>
                    Dente {n}
                    {t ? ` — ${t.name}` : ""}
                  </option>
                );
              })}
            </select>
          </label>

          {toothMeta ? (
            <div className="ai-sidebar__context">
              <strong>{toothMeta.name}</strong>
              <small>FDI {tooth}</small>
              <Link className="ai-sidebar__link" to={`/app/escultura/${tooth}`}>
                Abrir escultura deste dente →
              </Link>
            </div>
          ) : (
            <div className="ai-sidebar__context">
              <strong>Modo geral</strong>
              <small>Pergunte sobre qualquer especialidade</small>
            </div>
          )}

          <div className="ai-sidebar__block">
            <p className="ai-sidebar__hint">Áreas da odontologia</p>
            <div className="ai-topics" role="list">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className="ai-topics__chip"
                  role="listitem"
                  onClick={() => void send(t.prompt)}
                  disabled={loading}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-sidebar__block ai-sidebar__block--grow">
            <p className="ai-sidebar__hint">Sugestões rápidas</p>
            <ul className="ai-starters">
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => void send(s)} disabled={loading}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className="ai-sidebar__clear" onClick={clearChat}>
            Limpar conversa
          </button>
        </aside>

        <section className="ai-chat" aria-label="Conversa com o Odus">
          <div className="ai-chat__bg" aria-hidden="true">
            <div className="ai-chat__bg-odus">
              <AiMascot size={380} className="ai-chat__bg-mascot" label="" />
            </div>
          </div>

          <div className="ai-chat__toolbar">
            <span>Conversa com Odus</span>
            <div className="ai-chat__toolbar-meta">
              {engine && (
                <span
                  className={`ai-engine-badge ai-engine-badge--${engine}`}
                  title={
                    engine === "openai"
                      ? "Resposta com modelo OpenAI + base filtrada"
                      : "Resposta com base local filtrada (adicione OPENAI_API_KEY para modo pleno)"
                  }
                >
                  {engine === "openai" ? "Modo inteligente" : "Modo local"}
                </span>
              )}
              <small>
                {tooth ? `Contexto: dente ${tooth}` : "Contexto: odontologia geral"}
              </small>
            </div>
          </div>

          <div className="ai-chat__messages" ref={listRef} role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`ai-msg ai-msg--${m.role}`}>
                {m.role === "assistant" && (
                  <AiMascot size={44} className="ai-msg__avatar" label="" />
                )}
                <div className="ai-msg__bubble">
                  {m.text.split("\n").map((line, j) =>
                    line.trim() ? <p key={j}>{line}</p> : <br key={j} />,
                  )}
                  {m.imageUrl && (
                    <figure className="ai-msg__figure">
                      <img
                        src={m.imageUrl}
                        alt="Ilustração educacional gerada pelo Odus"
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption>Ilustração educacional gerada</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai-msg--assistant ai-msg--loading" aria-busy="true">
                <AiMascot size={44} className="ai-msg__avatar" label="" />
                <div className="ai-msg__bubble">Gerando resposta…</div>
              </div>
            )}
            <div ref={bottomRef} className="ai-chat__anchor" aria-hidden="true" />
          </div>

          <form className="ai-chat__input" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ou peça: gere uma imagem da oclusal do 16…"
              disabled={loading}
              aria-label="Sua dúvida"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
