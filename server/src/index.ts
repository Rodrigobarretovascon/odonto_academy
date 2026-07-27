import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";
import { ensureDatabase } from "./db/ensure.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(process.cwd(), "../.env") });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production";

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
];
const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? defaultOrigins;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

const modelsDir = resolve(__dirname, "../../models/stl");
const publicModelsDir = resolve(__dirname, "../../public/models");
const tmpDir = resolve(__dirname, "../../tmp");

if (existsSync(modelsDir)) app.use("/models", express.static(modelsDir));
if (existsSync(publicModelsDir)) app.use("/models", express.static(publicModelsDir));
if (existsSync(tmpDir)) app.use("/tmp", express.static(tmpDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Gabriela Barreto Dental API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

const distPath = resolve(__dirname, "../../dist");
if (isProd && existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/models") ||
      req.path.startsWith("/tmp")
    ) {
      return next();
    }
    res.sendFile(resolve(distPath, "index.html"));
  });
}

async function start() {
  if (isProd && process.env.DATABASE_URL) {
    try {
      await ensureDatabase();
      console.log("✓ Banco inicializado");
    } catch (err) {
      console.error("Erro ao inicializar banco:", err);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ API rodando em http://0.0.0.0:${PORT}${isProd ? " (produção)" : ""}`);
  });
}

start();
