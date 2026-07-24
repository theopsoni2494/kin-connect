import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "./requireAuth.js";

/**
 * Enforces that an admin request carries a department scope — every
<<<<<<< HEAD
 * non-master admin's department list is baked into their token at login
 * (see resolveAdminDepartments in auth.service.ts) — unless the admin is a
 * master admin. `scopedDepartmentIds = null` means "unrestricted" (master
 * admin) — every downstream query must branch on this value, never on
 * `req.auth` directly, so there is exactly one place scoping can be
 * forgotten. A non-master admin's list can hold one department, several, or
 * every department (the KN-02-style consolidated case) — all three just
 * filter with `IN (departmentIds)`, no separate "unrestricted" flag needed.
=======
 * non-master admin's department is baked into their token at login (see
 * resolveAdminDepartment in auth.service.ts) — unless the admin is a master
 * admin. `scopedDepartmentId = null` means "unrestricted" (master admin) —
 * every downstream query must branch on this value, never on `req.auth`
 * directly, so there is exactly one place scoping can be forgotten.
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
 */
export function requireAdminDepartment(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ error: "admin only" });
  }
<<<<<<< HEAD
  if (req.auth.isMaster) {
    req.scopedDepartmentIds = null;
    return next();
  }
  if (!req.auth.departmentIds || req.auth.departmentIds.length === 0) {
    return res.status(403).json({ error: "no department selected" });
  }
  req.scopedDepartmentIds = req.auth.departmentIds;
=======
  if (!req.auth.isMaster && !req.auth.departmentId) {
    return res.status(403).json({ error: "no department selected" });
  }
  req.scopedDepartmentId = req.auth.isMaster ? null : (req.auth.departmentId as number);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  next();
}

export function requireMasterAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin" || !req.auth.isMaster) {
    return res.status(403).json({ error: "master admin only" });
  }
  next();
}
