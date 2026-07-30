import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { query } from "../db/pool.js";
import { authRequired, hasActiveAccess, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };
  if (!email || !password || !name) {
    res.status(400).json({ error: "Preencha todos os campos" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await query<{ id: number; email: string; name: string; role: string }>(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       RETURNING id, email, name, role`,
      [email.toLowerCase(), hash, name],
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      res.status(409).json({ error: "E-mail já cadastrado" });
      return;
    }
    throw err;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha obrigatórios" });
    return;
  }
  const result = await query<{ id: number; email: string; name: string; role: string; password_hash: string }>(
    "SELECT id, email, name, role, password_hash FROM users WHERE email = $1",
    [email.toLowerCase()],
  );
  const row = result.rows[0];
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }
  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  res.json({ token: signToken(user), user });
});

router.get("/me", authRequired, async (req, res) => {
  const sub = await query<{ expires_at: Date; product_name: string }>(
    `SELECT s.expires_at, p.name AS product_name
     FROM subscriptions s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1 AND s.active = true AND s.expires_at > NOW()
     ORDER BY s.expires_at DESC LIMIT 1`,
    [req.user!.id],
  );
  const hasAccess = req.user!.role === "admin" || (await hasActiveAccess(req.user!.id));
  res.json({
    user: req.user,
    hasAccess,
    subscription: sub.rows[0] ?? null,
  });
});

/** Solicita reset — sempre responde 200 para não vazar e-mails. Em dev devolve token. */
router.post("/forgot-password", async (req, res) => {
  const email = String((req.body as { email?: string }).email ?? "")
    .toLowerCase()
    .trim();
  if (!email) {
    res.status(400).json({ error: "E-mail obrigatório" });
    return;
  }
  const user = await query<{ id: number }>(`SELECT id FROM users WHERE email = $1`, [email]);
  const message =
    "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.";
  if (!user.rows[0]) {
    res.json({ message });
    return;
  }
  const token = randomBytes(32).toString("hex");
  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + interval '2 hours')`,
    [user.rows[0].id, token],
  );
  // Integração de e-mail: configure SMTP_* ou provedor. Por enquanto, token só em não-produção.
  const payload: { message: string; resetTokenDev?: string } = { message };
  if (process.env.NODE_ENV !== "production") {
    payload.resetTokenDev = token;
  }
  res.json(payload);
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password || password.length < 6) {
    res.status(400).json({ error: "Token e senha (mín. 6) são obrigatórios" });
    return;
  }
  const row = await query<{ id: number; user_id: number }>(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [token],
  );
  if (!row.rows[0]) {
    res.status(400).json({ error: "Token inválido ou expirado" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, row.rows[0].user_id]);
  await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [row.rows[0].id]);
  res.json({ message: "Senha atualizada. Faça login." });
});

export default router;
