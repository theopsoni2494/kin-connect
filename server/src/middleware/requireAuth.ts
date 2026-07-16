import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenClaims } from "../services/auth.service.js";

export interface AuthedRequest extends Request {
  auth?: AccessTokenClaims;
  scopedDepartmentId?: number | null;
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
