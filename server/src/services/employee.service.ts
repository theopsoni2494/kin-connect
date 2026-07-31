import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { employees, admins } from "../db/schema.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { ParsedEmployeeRow } from "../utils/spreadsheet.js";

// Default password for spreadsheet-imported employees — a known, literal
// value (not the passwordless-first-login flow used by single creation)
// so a batch of employees can be communicated one shared starting
// credential; each can change it via self-service change-password whenever
// they like afterward.
export const BULK_IMPORT_DEFAULT_PASSWORD = "0000000000";

export interface BulkImportResult {
  created: string[];
  skippedExisting: string[];
  skippedInvalid: string[];
  updatedExisting: string[];
}

// Codes are a single shared namespace across employees and admins — the
// same code can never be a live employee AND a live admin at once. Only
// once the account holding a code is deleted does that code free up.
export async function isCodeTakenByAdmin(code: string): Promise<boolean> {
  const existing = await db.query.admins.findFirst({ where: eq(admins.code, code) });
  return !!existing;
}

export async function bulkCreateEmployees(rawRows: ParsedEmployeeRow[]): Promise<BulkImportResult> {
  const seen = new Set<string>();
  const skippedInvalid: string[] = [];
  const candidates: { code: string; label?: string; sector?: string }[] = [];
  for (const raw of rawRows) {
    const code = String(raw.code ?? "").trim().toUpperCase();
    if (!code) continue;
    if (code.length > 64 || !/^[A-Z0-9_.-]+$/.test(code)) {
      skippedInvalid.push(String(raw.code));
      continue;
    }
    if (seen.has(code)) continue;
    seen.add(code);
    candidates.push({ code, label: raw.name, sector: raw.sector });
  }
  if (candidates.length === 0) {
    return { created: [], skippedExisting: [], skippedInvalid, updatedExisting: [] };
  }

  const codes = candidates.map((c) => c.code);
  const [existingEmployeeRows, existingAdminRows] = await Promise.all([
    db.query.employees.findMany({ where: inArray(employees.code, codes) }),
    db.query.admins.findMany({ where: inArray(admins.code, codes) }),
  ]);
  const existingEmployeeByCode = new Map(existingEmployeeRows.map((e) => [e.code, e]));
  const existingCodes = new Set([
    ...existingEmployeeRows.map((e) => e.code),
    ...existingAdminRows.map((a) => a.code).filter((c): c is string => c !== null),
  ]);
  const toCreate = candidates.filter((c) => !existingCodes.has(c.code));

  if (toCreate.length > 0) {
    const passwordHash = await bcrypt.hash(BULK_IMPORT_DEFAULT_PASSWORD, 10);
    await db.insert(employees).values(
      toCreate.map((c) => ({
        code: c.code,
        passwordHash,
        label: c.label,
        sector: c.sector,
      })),
    );
  }

  // Re-importing the same sheet after a first pass that didn't detect a
  // column shouldn't require a full wipe — backfill any missing label/sector
  // for already-existing employees, but never overwrite a value that's already set.
  const updatedExisting: string[] = [];
  for (const c of candidates) {
    const existing = existingEmployeeByCode.get(c.code);
    if (!existing) continue;
    const patch: { label?: string; sector?: string } = {};
    if (c.label && !existing.label) patch.label = c.label;
    if (c.sector && !existing.sector) patch.sector = c.sector;
    if (Object.keys(patch).length > 0) {
      await db.update(employees).set({ ...patch, updatedAt: new Date() }).where(eq(employees.code, c.code));
      updatedExisting.push(c.code);
    }
  }

  return {
    created: toCreate.map((c) => c.code),
    skippedExisting: codes.filter((c) => existingCodes.has(c)),
    skippedInvalid,
    updatedExisting,
  };
}

export async function listEmployees() {
  return db.select().from(employees).orderBy(employees.code);
}

export async function createEmployee(
  code: string,
  whatsappNumber: string,
  label?: string,
  sector?: string | null,
) {
  const normalizedCode = code.trim().toUpperCase();
  const existing = await db.query.employees.findFirst({ where: eq(employees.code, normalizedCode) });
  if (existing) throw new HttpError(409, "employee code already exists");
  if (await isCodeTakenByAdmin(normalizedCode)) {
    throw new HttpError(409, "this code is already registered as an admin account — delete it there first");
  }

  // No password set at creation — passwordless first login claims it (see auth.service.ts).
  // whatsappNumber is contact info only, not a credential.
  const [row] = await db
    .insert(employees)
    .values({ code: normalizedCode, passwordHash: null, whatsappNumber: whatsappNumber.trim(), label, sector })
    .returning();
  return row;
}

export async function updateEmployee(
  code: string,
  patch: { label?: string; whatsappNumber?: string; isActive?: boolean; sector?: string | null },
) {
  const normalizedCode = code.trim().toUpperCase();
  const existing = await db.query.employees.findFirst({ where: eq(employees.code, normalizedCode) });
  if (!existing) throw new HttpError(404, "employee not found");

  const [row] = await db
    .update(employees)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(employees.code, normalizedCode))
    .returning();
  return row;
}

export async function deleteEmployee(code: string) {
  try {
    await db.delete(employees).where(eq(employees.code, code.trim().toUpperCase()));
  } catch (err) {
    if ((err as { code?: string }).code === "23503") {
      throw new HttpError(
        409,
        "cannot delete an employee with existing tickets — freeze the account instead",
      );
    }
    throw err;
  }
}
