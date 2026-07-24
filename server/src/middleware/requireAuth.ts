import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenClaims } from "../services/auth.service.js";

export interface AuthedRequest extends Request {
  auth?: AccessTokenClaims;
  scopedDepartmentIds?: number[] | null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing bearer token" });
  }
  const token = header.slice("Bearer ".length);
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

export function requireEmployee(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "employee") return res.status(403).json({ error: "employee only" });
  next();
}

/**
 * Blocks every route except /auth/set-initial-password (which doesn't use
 * this middleware) until a passwordless first-login account has set a real
 * password. Add this to every protected router right after requireAuth.
 */
export function requirePasswordSet(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.mustSetPassword) {
    return res.status(403).json({ error: "password_not_set" });
  }
  next();
}
