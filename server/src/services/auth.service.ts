import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import { admins, adminDepartments, departments, employees, refreshTokens } from "../db/schema.js";
import { config } from "../config/env.js";

/**
 * Every non-master admin's department assignment(s) are resolved here and
 * baked straight into the token as a plain list — no "pick a department"
 * step at login. An admin can be assigned any subset of departments (one,
 * several, or literally all of them — the KN-02-style consolidated admin is
 * just the case where the list happens to cover every department). Ticket
 * queries filter with `IN (departmentIds)`, so an admin assigned to every
 * department behaves identically to "unrestricted" without needing a
 * separate flag.
 */
async function resolveAdminDepartments(adminId: string): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: departments.id, name: departments.name })
    .from(adminDepartments)
    .innerJoin(departments, eq(adminDepartments.departmentId, departments.id))
    .where(eq(adminDepartments.adminId, adminId))
    .orderBy(adminDepartments.departmentId);
}

export interface AccessTokenClaims {
  sub: string;
  role: "employee" | "admin";
  // Non-master admin's assigned departments (baked in at login/refresh).
  // Absent/undefined for master admins, who are unrestricted.
  departmentIds?: number[];
  isMaster?: boolean;
  // Account has no password set yet (passwordHash is null) — every route
  // except /auth/set-initial-password is blocked until this is cleared.
  mustSetPassword?: boolean;
}

function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign(claims, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_TTL,
  } as SignOptions);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenClaims;
}

async function issueRefreshToken(subjectType: "employee" | "admin", subjectId: string) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + parseTtlMs(config.JWT_REFRESH_TTL));
  await db.insert(refreshTokens).values({
    subjectType,
    subjectId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return token;
}

function parseTtlMs(ttl: string): number {
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

export async function loginEmployee(code: string, password: string) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.code, code.trim().toUpperCase()))
    .limit(1);
  if (!employee || !employee.isActive) return null;

  const mustSetPassword = employee.passwordHash === null;
  if (!mustSetPassword) {
    const ok = await bcrypt.compare(password, employee.passwordHash as string);
    if (!ok) return null;
  }

  const accessToken = signAccessToken({ sub: employee.code, role: "employee", mustSetPassword });
  const refreshToken = await issueRefreshToken("employee", employee.code);
  return { accessToken, refreshToken, employee, mustSetPassword };
}

export async function loginAdmin(code: string, password: string) {
  const normalizedCode = code.trim().toUpperCase();
  const [admin] = await db.select().from(admins).where(eq(admins.code, normalizedCode)).limit(1);
  if (!admin || !admin.isActive) return null;

  const mustSetPassword = admin.passwordHash === null;
  if (!mustSetPassword) {
    const ok = await bcrypt.compare(password, admin.passwordHash as string);
    if (!ok) return null;
  }

  const departments_ = admin.isMaster ? [] : await resolveAdminDepartments(admin.id);
  if (!admin.isMaster && departments_.length === 0) return "no-department" as const;

  const accessToken = signAccessToken({
    sub: admin.id,
    role: "admin",
    departmentIds: admin.isMaster ? undefined : departments_.map((d) => d.id),
    isMaster: admin.isMaster,
    mustSetPassword,
  });
  const refreshToken = await issueRefreshToken("admin", admin.id);
  return { accessToken, refreshToken, admin, departments: departments_, mustSetPassword };
}

export async function refreshSession(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
    .limit(1);
  if (!row || row.expiresAt < new Date()) return null;

  if (row.subjectType === "employee") {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.code, row.subjectId))
      .limit(1);
    if (!employee || !employee.isActive) return null;
    const accessToken = signAccessToken({
      sub: employee.code,
      role: "employee",
      mustSetPassword: employee.passwordHash === null,
    });
    return { accessToken };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.id, row.subjectId)).limit(1);
  if (!admin || !admin.isActive) return null;
  const departments_ = admin.isMaster ? [] : await resolveAdminDepartments(admin.id);
  if (!admin.isMaster && departments_.length === 0) return null;
  const accessToken = signAccessToken({
    sub: admin.id,
    role: "admin",
    departmentIds: admin.isMaster ? undefined : departments_.map((d) => d.id),
    isMaster: admin.isMaster,
    mustSetPassword: admin.passwordHash === null,
  });
  return { accessToken };
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function resetEmployeePassword(employeeCode: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db
    .update(employees)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(employees.code, employeeCode.trim().toUpperCase()));
}

// Self-service password change for the logged-in employee/admin. Password is
// intentionally decoupled from an employee's WhatsApp number here — it's a
// real, independent credential once the account holder sets their own.
// Accounts with no password set yet (passwordHash null) have no "current
// password" to verify — they go through setInitialPassword instead.
export async function changeOwnPassword(
  claims: AccessTokenClaims,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  if (claims.role === "employee") {
    const [employee] = await db.select().from(employees).where(eq(employees.code, claims.sub)).limit(1);
    if (!employee || !employee.passwordHash) return false;
    const ok = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!ok) return false;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(employees).set({ passwordHash, updatedAt: new Date() }).where(eq(employees.code, claims.sub));
    return true;
  }

  const [admin] = await db.select().from(admins).where(eq(admins.id, claims.sub)).limit(1);
  if (!admin || !admin.passwordHash) return false;
  const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!ok) return false;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(admins).set({ passwordHash, updatedAt: new Date() }).where(eq(admins.id, claims.sub));
  return true;
}

// First-login-only: claims a not-yet-claimed account (passwordHash null) by
// setting its real password. Rejects if a password is already set — that
// case must go through changeOwnPassword instead.
export async function setInitialPassword(claims: AccessTokenClaims, newPassword: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  if (claims.role === "employee") {
    const [employee] = await db.select().from(employees).where(eq(employees.code, claims.sub)).limit(1);
    if (!employee || employee.passwordHash !== null) return false;
    await db.update(employees).set({ passwordHash, updatedAt: new Date() }).where(eq(employees.code, claims.sub));
    return true;
  }

  const [admin] = await db.select().from(admins).where(eq(admins.id, claims.sub)).limit(1);
  if (!admin || admin.passwordHash !== null) return false;
  await db.update(admins).set({ passwordHash, updatedAt: new Date() }).where(eq(admins.id, claims.sub));
  return true;
}
