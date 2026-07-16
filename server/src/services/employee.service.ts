import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { employees } from "../db/schema.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function listEmployees() {
  return db.select().from(employees).orderBy(employees.code);
}

export async function createEmployee(code: string, whatsappNumber: string, label?: string) {
  const normalizedCode = code.trim().toUpperCase();
  const existing = await db.query.employees.findFirst({ where: eq(employees.code, normalizedCode) });
  if (existing) throw new HttpError(409, "employee code already exists");

  // Password defaults to the employee's WhatsApp number, per requirement.
  const passwordHash = await bcrypt.hash(whatsappNumber.trim(), 10);
  const [row] = await db
    .insert(employees)
    .values({ code: normalizedCode, passwordHash, whatsappNumber: whatsappNumber.trim(), label })
    .returning();
  return row;
}

export async function updateEmployee(
  code: string,
  patch: { label?: string; whatsappNumber?: string; isActive?: boolean },
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
