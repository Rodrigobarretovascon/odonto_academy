import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const STARTERS = [
  "Como marcar a cera corretamente?",
  "Qual a diferença entre mesial e distal?",
  "Como esculpir a oclusal do molar?",
  "Quais instrumentos usar na escultura?",
];

export function AiChatPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Olá! Sou a assistente da Academia Gabriela Barreto. Tire suas dúvidas sobre escultura em cera, anatomia ou instrumentos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooth, setTooth] = useState("13");

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const data = await api<{ reply: string }>(
        "/ai/chat",
        { method: "POST", body: JSON.stringify({ message: text, toothNumber: tooth }) },
        token,
      );
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Não foi possível responder agora. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <header className="page-header">
        <h1>Tirar Dúvidas com IA</h1>
        <p>Assistente para escultura em cera — contexto do dente selecionado</p>
      </header>
      <div className="ai-layout">
        <aside className="ai-sidebar">
          <label>
            Dente em estudo
            <select value={tooth} onChange={(e) => setTooth(e.target.value)}>
              {["11", "12", "13", "14", "15", "16", "17", "36", "46"].map((n) => (
                <option key={n} value={n}>
                  Dente {n}
                </option>
              ))}
            </select>
          </label>
          <p className="ai-sidebar__hint">Sugestões:</p>
          <ul className="ai-starters">
            {STARTERS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => send(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="ai-chat">
          <div className="ai-chat__messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.role}`}>
                {m.text.split("\n").map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            ))}
            {loading && <div className="ai-msg ai-msg--assistant">Pensando…</div>}
          </div>
          <form
            className="ai-chat__input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida…"
              disabled={loading}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
