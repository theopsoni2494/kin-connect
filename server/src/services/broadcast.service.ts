<<<<<<< HEAD
import { eq, desc, inArray } from "drizzle-orm";
=======
import { eq, desc } from "drizzle-orm";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { db } from "../db/client.js";
import { broadcasts, broadcastRecipients, tickets, employees, attachments } from "../db/schema.js";
import { toAttachmentDto, type AttachmentDto } from "./attachment.service.js";
import { HttpError } from "../middleware/errorHandler.js";

export interface BroadcastDto {
  id: string;
  targetType: string;
  targetEmployeeCode?: string | null;
  targetDepartmentId?: number | null;
  message: string;
  createdAt: string;
  attachment?: AttachmentDto | null;
  recipientCount: number;
}

async function resolveRecipients(
  targetType: "employee" | "department" | "all",
  targetEmployeeCode: string | undefined,
<<<<<<< HEAD
  scopedDepartmentIds: number[] | null,
=======
  scopedDepartmentId: number | null,
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
): Promise<string[]> {
  if (targetType === "employee") {
    if (!targetEmployeeCode) throw new HttpError(400, "targetEmployeeCode is required");
    const code = targetEmployeeCode.trim().toUpperCase();
    const exists = await db.query.employees.findFirst({ where: eq(employees.code, code) });
    if (!exists) throw new HttpError(400, "unknown employee code");
    return [code];
  }

  if (targetType === "department") {
<<<<<<< HEAD
    // Not currently exposed in the UI (alerts are always sent per-employee) —
    // kept working for API completeness. With a multi-department admin this
    // targets every one of their assigned departments, not just one.
    if (scopedDepartmentIds === null) throw new HttpError(400, "department target requires a scoped department");
    const rows = await db
      .selectDistinct({ employeeCode: tickets.employeeCode })
      .from(tickets)
      .where(inArray(tickets.departmentId, scopedDepartmentIds));
=======
    if (scopedDepartmentId === null) throw new HttpError(400, "department target requires a scoped department");
    const rows = await db
      .selectDistinct({ employeeCode: tickets.employeeCode })
      .from(tickets)
      .where(eq(tickets.departmentId, scopedDepartmentId));
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    return rows.map((r) => r.employeeCode);
  }

  // 'all' — master admin only (enforced by route)
  const rows = await db.select({ code: employees.code }).from(employees);
  return rows.map((r) => r.code);
}

export async function sendBroadcast(
  senderAdminId: string,
  targetType: "employee" | "department" | "all",
  message: string,
<<<<<<< HEAD
  scopedDepartmentIds: number[] | null,
  targetEmployeeCode?: string,
  attachmentId?: string,
) {
  const recipients = await resolveRecipients(targetType, targetEmployeeCode, scopedDepartmentIds);
=======
  scopedDepartmentId: number | null,
  targetEmployeeCode?: string,
  attachmentId?: string,
) {
  const recipients = await resolveRecipients(targetType, targetEmployeeCode, scopedDepartmentId);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  if (recipients.length === 0) throw new HttpError(400, "no recipients matched");

  const [broadcast] = await db
    .insert(broadcasts)
    .values({
      senderAdminId,
      targetType,
      targetEmployeeCode: targetType === "employee" ? recipients[0] : undefined,
<<<<<<< HEAD
      targetDepartmentId: targetType === "department" ? scopedDepartmentIds?.[0] : undefined,
=======
      targetDepartmentId: targetType === "department" ? scopedDepartmentId : undefined,
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      message,
      attachmentId,
    })
    .returning();

  await db
    .insert(broadcastRecipients)
    .values(recipients.map((code) => ({ broadcastId: broadcast.id, employeeCode: code })));

  return { broadcast, recipients };
}

export async function listBroadcastsForEmployee(employeeCode: string) {
  const code = employeeCode.trim().toUpperCase();
  const rows = await db
    .select({ broadcast: broadcasts, readAt: broadcastRecipients.readAt })
    .from(broadcastRecipients)
    .innerJoin(broadcasts, eq(broadcastRecipients.broadcastId, broadcasts.id))
    .where(eq(broadcastRecipients.employeeCode, code))
    .orderBy(desc(broadcasts.createdAt));

  return Promise.all(
    rows.map(async ({ broadcast }) => toBroadcastDto(broadcast)),
  );
}

export async function listSentBroadcasts(senderAdminId: string | null) {
  const rows = senderAdminId
    ? await db.select().from(broadcasts).where(eq(broadcasts.senderAdminId, senderAdminId)).orderBy(desc(broadcasts.createdAt))
    : await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
  return Promise.all(rows.map(toBroadcastDto));
}

async function toBroadcastDto(b: typeof broadcasts.$inferSelect): Promise<BroadcastDto> {
  const recipientRows = await db
    .select()
    .from(broadcastRecipients)
    .where(eq(broadcastRecipients.broadcastId, b.id));
  let attachment: AttachmentDto | null = null;
  if (b.attachmentId) {
    const a = await db.query.attachments.findFirst({ where: eq(attachments.id, b.attachmentId) });
    if (a) attachment = await toAttachmentDto(a);
  }
  return {
    id: b.id,
    targetType: b.targetType,
    targetEmployeeCode: b.targetEmployeeCode,
    targetDepartmentId: b.targetDepartmentId,
    message: b.message,
    createdAt: b.createdAt.toISOString(),
    attachment,
    recipientCount: recipientRows.length,
  };
}
