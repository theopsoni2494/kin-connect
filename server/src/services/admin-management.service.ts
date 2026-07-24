import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { admins, adminDepartments, departments, employees } from "../db/schema.js";
import { HttpError } from "../middleware/errorHandler.js";

export interface AdminDto {
  id: string;
  code: string;
  name: string;
  isMaster: boolean;
  isActive: boolean;
  departments: { id: number; name: string }[];
}

async function toAdminDto(admin: typeof admins.$inferSelect): Promise<AdminDto> {
  let adminDepts: { id: number; name: string }[] = [];
  if (!admin.isMaster) {
    adminDepts = await db
      .select({ id: departments.id, name: departments.name })
      .from(adminDepartments)
      .innerJoin(departments, eq(adminDepartments.departmentId, departments.id))
      .where(eq(adminDepartments.adminId, admin.id))
      .orderBy(departments.sortOrder);
  }
  return {
    id: admin.id,
    code: admin.code ?? "",
    name: admin.name,
    isMaster: admin.isMaster,
    isActive: admin.isActive,
    departments: adminDepts,
  };
}

export async function listAdmins(): Promise<AdminDto[]> {
  const rows = await db.select().from(admins).orderBy(admins.code);
  return Promise.all(rows.map(toAdminDto));
}

export async function createAdmin(input: {
  code: string;
  name: string;
  isMaster: boolean;
  departmentIds?: number[];
}): Promise<AdminDto> {
  const code = input.code.trim().toUpperCase();
  const existing = await db.query.admins.findFirst({ where: eq(admins.code, code) });
  if (existing) throw new HttpError(409, "admin code already exists");
  // Codes are a single shared namespace across employees and admins — the
  // same code can never be a live employee AND a live admin at once.
  const takenByEmployee = await db.query.employees.findFirst({ where: eq(employees.code, code) });
  if (takenByEmployee) {
    throw new HttpError(409, "this code is already registered as an employee account — delete it there first");
  }

  const departmentIds = input.departmentIds ?? [];
  if (!input.isMaster) {
    if (departmentIds.length === 0) throw new HttpError(400, "at least one department is required for non-master admins");
    const found = await db.query.departments.findMany({ where: inArray(departments.id, departmentIds) });
    if (found.length !== departmentIds.length) throw new HttpError(400, "unknown department");
  }

  // No password set at creation — passwordless first login claims it (see auth.service.ts).
  const [row] = await db
    .insert(admins)
    .values({ code, passwordHash: null, name: input.name.trim(), isMaster: input.isMaster })
    .returning();

  if (!input.isMaster && departmentIds.length > 0) {
    await db.insert(adminDepartments).values(departmentIds.map((departmentId) => ({ adminId: row.id, departmentId })));
  }

  return toAdminDto(row);
}

export async function updateAdmin(
  id: string,
  patch: { name?: string; isActive?: boolean; departmentIds?: number[] },
): Promise<AdminDto> {
  const existing = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!existing) throw new HttpError(404, "admin not found");

  const updates: Partial<typeof admins.$inferInsert> = { updatedAt: new Date() };
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.isActive !== undefined) updates.isActive = patch.isActive;

  const [row] = await db.update(admins).set(updates).where(eq(admins.id, id)).returning();

  if (patch.departmentIds !== undefined && !existing.isMaster) {
    if (patch.departmentIds.length === 0) throw new HttpError(400, "at least one department is required for non-master admins");
    const found = await db.query.departments.findMany({ where: inArray(departments.id, patch.departmentIds) });
    if (found.length !== patch.departmentIds.length) throw new HttpError(400, "unknown department");
    await db.delete(adminDepartments).where(eq(adminDepartments.adminId, id));
    await db.insert(adminDepartments).values(patch.departmentIds.map((departmentId) => ({ adminId: id, departmentId })));
  }

  return toAdminDto(row);
}

export async function deleteAdmin(id: string): Promise<void> {
  try {
    await db.delete(admins).where(eq(admins.id, id));
  } catch (err) {
    if ((err as { code?: string }).code === "23503") {
      throw new HttpError(
        409,
        "cannot delete an admin with existing replies or sent alerts — freeze the account instead",
      );
    }
    throw err;
  }
}

export async function resetAdminPassword(id: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(admins).set({ passwordHash, updatedAt: new Date() }).where(eq(admins.id, id));
}
