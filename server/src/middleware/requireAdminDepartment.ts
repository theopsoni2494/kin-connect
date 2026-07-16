import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "./requireAuth.js";

/**
 * Enforces that an admin request carries a department scope — every
 * non-master admin's department is baked into their token at login (see
 * resolveAdminDepartment in auth.service.ts) — unless the admin is a master
 * admin. `scopedDepartmentId = null` means "unrestricted" (master admin) —
 * every downstream query must branch on this value, never on `req.auth`
 * directly, so there is exactly one place scoping can be forgotten.
 */
export function requireAdminDepartment(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ error: "admin only" });
  }
  if (!req.auth.isMaster && !req.auth.departmentId) {
    return res.status(403).json({ error: "no department selected" });
  }
  req.scopedDepartmentId = req.auth.isMaster ? null : (req.auth.departmentId as number);
  next();
}

export function requireMasterAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin" || !req.auth.isMaster) {
    return res.status(403).json({ error: "master admin only" });
  }
  next();
}
