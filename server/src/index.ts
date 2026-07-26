import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(process.cwd(), "../.env") });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/models", express.static(resolve(__dirname, "../../models/stl")));
app.use("/models", express.static(resolve(__dirname, "../../public/models")));
app.use("/tmp", express.static(resolve(__dirname, "../../tmp")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Gabriela Barreto Dental API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`✓ API rodando em http://localhost:${PORT}`);
});
