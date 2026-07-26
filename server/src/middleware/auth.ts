import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db/pool.js";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: "Sessão expirada" });
  }
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  authRequired(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Acesso restrito" });
      return;
    }
    next();
  });
}

export async function hasActiveAccess(userId: number): Promise<boolean> {
  if (!userId) return false;
  const user = await query<{ role: string }>("SELECT role FROM users WHERE id = $1", [userId]);
  if (user.rows[0]?.role === "admin") return true;
  const sub = await query(
    `SELECT 1 FROM subscriptions
     WHERE user_id = $1 AND active = true AND expires_at > NOW()
     LIMIT 1`,
    [userId],
  );
  return sub.rowCount !== null && sub.rowCount > 0;
}

export async function subscriptionRequired(req: Request, res: Response, next: NextFunction) {
  authRequired(req, res, async () => {
    if (!req.user) return;
    if (req.user.role === "admin") {
      next();
      return;
    }
    const ok = await hasActiveAccess(req.user.id);
    if (!ok) {
      res.status(403).json({ error: "Assinatura expirada ou inativa. Renove seu plano." });
      return;
    }
    next();
  });
}
