/**
 * Assistente técnica GB Dental — público de odontologia.
 * Busca ampla → filtra fontes → OpenAI (se houver chave) ou síntese local direta.
 */

import {
  extractKeyPoints,
  getToothContext,
  isSculptureQuestion,
  retrieveKnowledgeScored,
  type KnowledgeChunk,
  type ScoredChunk,
} from "./dental-knowledge.js";
import { generateDentalImage, wantsImageGeneration } from "./ai-image.js";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ChatRequest {
  message: string;
  toothNumber?: string;
  history?: ChatTurn[];
}

export interface ChatResult {
  reply: string;
  engine: "openai" | "local";
  imageUrl?: string;
}

const SYSTEM_PROMPT = `Você é o Odus, assistente técnico educacional do GB Dental (Gabriela Barreto Dental), voltado a estudantes e profissionais de odontologia.

Público: pessoas da área — use terminologia correta (FDI, faces, pulpite, inserção clínica, Angle, ALARA, etc.) sem didatismo infantil.

Estilo:
1) Resposta direta na 1ª frase.
2) Em seguida 3–6 bullets objetivos (mecanismo, diferencial, passos, cuidados).
3) Se couber: 1 linha de “limite clínico” (quando precisa de exame presencial).
4) Sem enrolação, sem repetir a pergunta, sem elogios vazios.
5) Filtre as fontes: use só o que responde; ignore o resto.
6) Priorize o trecho mais específico se houver conflito.

Cobertura: anatomia/histologia; FDI; dentística e adesão; endodontia; periodontia; prótese/implantes; ortodontia; cirurgia; odontopediatria; radiologia/CBCT; oclusão/DTM; anestesia; farmacologia conceitual (sem posologia); prevenção; estomatologia; biossegurança; ética; escultura em cera do app quando perguntarem. Você também pode acompanhar ilustrações geradas quando o aluno pedir imagem.

Regras rígidas:
- Português do Brasil.
- Não invente medidas, doses ou protocolos de marca.
- NÃO diagnostique o paciente do aluno; NÃO prescrita medicamentos/doses.
- Urgência (dor intensa, abscesso, trauma, avulsão) → atendimento presencial.
- Escultura/cera/Lecron só se a dúvida for sobre isso.
- Dente FDI: use se ajudar.
- Feche com: “Conteúdo educacional — não substitui professor/dentista.”`;

function buildSearchQuery(message: string, history?: ChatTurn[], toothNumber?: string): string {
  const prevUser = (history ?? [])
    .filter((h) => h.role === "user")
    .slice(-2)
    .map((h) => h.text)
    .join(" ");
  const toothBit = toothNumber ? ` dente FDI ${toothNumber}` : "";
  return `${message} ${prevUser}${toothBit}`.trim();
}

function filterChunks(scored: ScoredChunk[], max = 5): KnowledgeChunk[] {
  if (!scored.length) return [];
  const top = scored[0]?.score ?? 0;
  const threshold = Math.max(3, top * 0.4);
  return scored
    .filter((s) => s.score >= threshold)
    .slice(0, max)
    .map((s) => s.chunk);
}

function buildLocalReply(
  message: string,
  chunks: KnowledgeChunk[],
  toothNumber?: string,
): string {
  const tooth = toothNumber ? getToothContext(toothNumber) : null;
  const sculpture = isSculptureQuestion(message);
  const lines: string[] = [];

  if (!chunks.length) {
    lines.push(
      "Não achei fonte específica o bastante. Cite a especialidade (ex.: endodontia, periodontia, Angle) ou o FDI.",
    );
    lines.push("Conteúdo educacional — não substitui professor/dentista.");
    return lines.join("\n\n");
  }

  const primary = chunks[0]!;
  const points = extractKeyPoints(primary.body, 3);
  const lead =
    points[0] ??
    primary.body.split(/(?<=[.!?])\s+/)[0] ??
    primary.body;
  lines.push(lead);

  if (
    tooth &&
    (sculpture ||
      /anatom|dente|fdi|face|cuspide|cúspide|incis|molar|canino|premolar|pré-molar/i.test(
        message,
      ))
  ) {
    lines.push(
      sculpture
        ? `${tooth.name} (FDI ${tooth.number}): ${tooth.anatomy} Medidas: ${tooth.measures}. ${tooth.sculptureTips}`
        : `${tooth.name} (FDI ${tooth.number}): ${tooth.anatomy}`,
    );
  }

  const bullets: string[] = [];
  for (const point of points.slice(1)) bullets.push(point);
  for (const c of chunks.slice(1)) {
    for (const point of extractKeyPoints(c.body, 2)) {
      if (bullets.length >= 6) break;
      if (lead && point.slice(0, 36) === lead.slice(0, 36)) continue;
      bullets.push(point);
    }
    if (bullets.length >= 6) break;
  }

  if (bullets.length) {
    lines.push(bullets.map((b) => `• ${b}`).join("\n"));
  }

  if (sculpture && toothNumber) {
    lines.push(`Prática no app: /app/escultura/${toothNumber}`);
  }

  lines.push("Conteúdo educacional — não substitui professor/dentista.");
  return lines.join("\n\n");
}

function historyToOpenAi(history: ChatTurn[] | undefined, message: string) {
  const msgs: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  const recent = (history ?? []).slice(-8);
  for (const h of recent) {
    msgs.push({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.text,
    });
  }
  if (!recent.length || recent[recent.length - 1]?.text !== message) {
    msgs.push({ role: "user", content: message });
  }
  return msgs;
}

async function replyWithOpenAI(
  message: string,
  toothNumber: string | undefined,
  history: ChatTurn[] | undefined,
  chunks: KnowledgeChunk[],
  scoredMeta: ScoredChunk[],
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const tooth = toothNumber ? getToothContext(toothNumber) : null;
  const sculpture = isSculptureQuestion(message);

  const knowledgeBlock = chunks
    .map((c, i) => {
      const score = scoredMeta.find((s) => s.chunk.id === c.id)?.score ?? "?";
      return `### Fonte ${i + 1} (score ${score}) — ${c.title}\n${c.body}`;
    })
    .join("\n\n");

  const contextBlock = [
    `Pergunta: ${message}`,
    "Filtre e sintetize com precisão técnica. Estrutura: 1 frase-resposta + bullets. Sem posologia.",
    tooth
      ? `Contexto FDI ${tooth.number} — ${tooth.name}. Anatomia: ${tooth.anatomy}. Medidas: ${tooth.measures}. Escultura (só se caber): ${tooth.sculptureTips}`
      : "Sem dente selecionado.",
    sculpture
      ? "Tema escultura: cera + Lecron e roteiro do app são válidos."
      : "NÃO desvie para escultura/cera.",
    knowledgeBlock
      ? `Fontes filtradas da base GB Dental:\n${knowledgeBlock}`
      : "Sem fontes fortes — responda com conceito odontológico geral sólido e peça o detalhe que falta.",
  ].join("\n\n");

  const messages = historyToOpenAi(history, message);
  messages.splice(1, 0, {
    role: "system",
    content: contextBlock,
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 550,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[ai] OpenAI error", res.status, errText.slice(0, 400));
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function answerDentalQuestion(req: ChatRequest): Promise<ChatResult> {
  const message = req.message.trim();
  const wantsImage = wantsImageGeneration(message);

  let imageUrl: string | undefined;
  if (wantsImage) {
    try {
      const img = await generateDentalImage(message, req.toothNumber);
      if (img) {
        imageUrl = img.url;
      }
    } catch (err) {
      console.error("[ai] image generation failed", err);
    }
  }

  const toothForRetrieval =
    req.toothNumber &&
    (isSculptureQuestion(message) ||
      wantsImage ||
      /anatom|dente\s*\d|fdi|face|cuspide|cúspide|incis|molar|canino|premolar|pré-molar|escultur/i.test(
        message,
      ))
      ? req.toothNumber
      : undefined;

  const searchQuery = buildSearchQuery(message, req.history, toothForRetrieval);

  const scored = retrieveKnowledgeScored(searchQuery, {
    limit: 10,
    candidateLimit: 20,
    minScore: 2,
    toothNumber: toothForRetrieval,
  });
  const chunks = filterChunks(scored, 5);

  const imageNote = wantsImage
    ? imageUrl
      ? "\n\nIlustração educacional gerada abaixo (atlas/diagrama — não é foto clínica de paciente)."
      : "\n\nNão foi possível gerar a imagem agora. Confira se OPENAI_API_KEY está no .env e reinicie o server — ou reformule o pedido (ex.: “gere uma imagem da oclusal do molar 16”)."
    : "";

  try {
    const openaiReply = await replyWithOpenAI(
      message,
      req.toothNumber,
      req.history,
      chunks,
      scored,
    );
    if (openaiReply) {
      return {
        reply: `${openaiReply}${imageNote}`,
        engine: "openai",
        imageUrl,
      };
    }
  } catch (err) {
    console.error("[ai] OpenAI failed, using local engine", err);
  }

  const local = buildLocalReply(message, chunks, req.toothNumber);
  return {
    reply: `${local}${imageNote}`,
    engine: imageUrl ? "openai" : "local",
    imageUrl,
  };
}
