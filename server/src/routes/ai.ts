import { Router } from "express";
import { subscriptionRequired } from "../middleware/auth.js";

const router = Router();

const FAQ_RESPONSES: Record<string, string> = {
  cera: "Use blocos de cera calibrados e marque a linha cervical antes de iniciar o desgaste. Remova material aos poucos — é mais fácil tirar do que adicionar.",
  mesial:
    "A face mesial é voltada para a linha média do arco. Na escultura, trace o contorno nas proximais antes do desgaste grosseiro.",
  oclusal:
    "Para dentes posteriores, identifique primeiro os sulcos centrais e as cúspides. Escave os sulcos com instrumento fino e mantenha a inclinação das paredes.",
  instrumentos:
    "Os essenciais são: Le cron, estilete, escova, meia fina e régua. Evite remover cera demais nas fases iniciais.",
};

router.post("/chat", subscriptionRequired, async (req, res) => {
  const { message, toothNumber } = req.body as { message?: string; toothNumber?: string };
  if (!message?.trim()) {
    res.status(400).json({ error: "Digite sua dúvida" });
    return;
  }

  const lower = message.toLowerCase();
  let reply =
    "Ótima pergunta! Revise o passo correspondente no guia de escultura e compare com as vistas finais do dente.";

  for (const [key, text] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) {
      reply = text;
      break;
    }
  }

  if (toothNumber) {
    reply += ` (Contexto: dente ${toothNumber})`;
  }

  reply +=
    "\n\n💡 Em breve esta resposta será gerada por IA com base no conteúdo completo da Academia Gabriela Barreto.";

  res.json({ reply });
});

export default router;
