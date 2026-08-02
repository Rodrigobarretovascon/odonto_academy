/**
 * Geração de imagens educacionais odontológicas via OpenAI Images.
 * Salva em public/uploads/ai/ e devolve URL pública /uploads/ai/...
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getToothContext } from "./dental-knowledge.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = resolve(__dirname, "../../../public/uploads/ai");

export function wantsImageGeneration(message: string): boolean {
  const q = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return /(ger(e|ar|a)|crie|criar|desenhe|desenhar|ilustre|ilustrar|mostre|mostrar).{0,40}(imagem|figura|ilustra|desenho|diagrama|esquema)|(imagem|figura|diagrama|esquema)\s+(de|do|da|dos|das)\b|\b(desenhe|desenhar|ilustre|ilustrar)\b|generate\s+(an?\s+)?image|draw\s+(me\s+)?(a\s+)?|illustrat/.test(
    q,
  );
}

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

/** Prompt visual educacional — evita foto clínica realista de paciente. */
export function buildDentalImagePrompt(message: string, toothNumber?: string): string {
  const tooth = toothNumber ? getToothContext(toothNumber) : null;
  const topic = message
    .replace(/gera(r|)\s*(uma\s+)?(imagem|figura|ilustração|ilustracao|desenho|diagrama|esquema)/gi, "")
    .replace(/desenhe|ilustre|mostre|crie/gi, "")
    .trim()
    .slice(0, 500);

  const toothLine = tooth
    ? `Focus on FDI tooth ${tooth.number} (${tooth.name}). Anatomy cues: ${tooth.anatomy}`
    : "General dental anatomy / clinical education topic as requested.";

  return [
    "Educational dental illustration for dentistry students and professionals.",
    "Clean textbook / atlas style diagram, high clarity, labeled structures when helpful.",
    "White or soft clinical background, accurate proportions, professional medical illustration look.",
    "NOT a photograph of a real patient. NOT gore. NOT cartoon mascot style.",
    "No text watermarks. Minimal text labels in Portuguese or anatomical Latin if needed.",
    toothLine,
    `User request: ${topic || message}`,
  ].join(" ");
}

export interface GeneratedImage {
  url: string;
  promptUsed: string;
}

export async function generateDentalImage(
  message: string,
  toothNumber?: string,
): Promise<GeneratedImage | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "dall-e-3";
  const prompt = buildDentalImagePrompt(message, toothNumber);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: prompt.slice(0, 3900),
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      ...(model.startsWith("dall-e") ? { quality: "standard" } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[ai-image] OpenAI error", res.status, errText.slice(0, 500));
    return null;
  }

  const data = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const item = data.data?.[0];
  if (!item) return null;

  ensureUploadDir();
  const id = `${Date.now()}-${createHash("sha1")
    .update(randomBytes(8))
    .digest("hex")
    .slice(0, 10)}`;
  const filename = `${id}.png`;
  const filepath = resolve(UPLOAD_DIR, filename);

  if (item.b64_json) {
    writeFileSync(filepath, Buffer.from(item.b64_json, "base64"));
  } else if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    writeFileSync(filepath, buf);
  } else {
    return null;
  }

  return {
    url: `/uploads/ai/${filename}`,
    promptUsed: prompt,
  };
}
