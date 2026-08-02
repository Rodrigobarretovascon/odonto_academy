import { Router } from "express";
import { subscriptionRequired } from "../middleware/auth.js";
import { answerDentalQuestion, type ChatTurn } from "../services/ai-chat.js";

const router = Router();

router.post("/chat", subscriptionRequired, async (req, res) => {
  const { message, toothNumber, history } = req.body as {
    message?: string;
    toothNumber?: string;
    history?: ChatTurn[];
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "Digite sua dúvida" });
    return;
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (h): h is ChatTurn =>
            !!h &&
            (h.role === "user" || h.role === "assistant") &&
            typeof h.text === "string" &&
            h.text.trim().length > 0,
        )
        .slice(-10)
        .map((h) => ({ role: h.role, text: h.text.trim().slice(0, 4000) }))
    : undefined;

  try {
    const result = await answerDentalQuestion({
      message: message.trim().slice(0, 4000),
      toothNumber: toothNumber ? String(toothNumber).slice(0, 4) : undefined,
      history: safeHistory,
    });
    res.json({
      reply: result.reply,
      engine: result.engine,
      imageUrl: result.imageUrl ?? null,
    });
  } catch (err) {
    console.error("[ai] chat failed", err);
    res.status(500).json({ error: "Não foi possível responder agora" });
  }
});

export default router;
