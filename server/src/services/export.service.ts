<<<<<<< HEAD
import { and, gte, lte, eq, inArray } from "drizzle-orm";
=======
import { and, gte, lte, eq } from "drizzle-orm";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { db } from "../db/client.js";
import { tickets, departments, replies } from "../db/schema.js";
import { toCsv } from "../utils/csv.js";

export async function exportTicketsCsv(
  from: Date,
  to: Date,
<<<<<<< HEAD
  scopedDepartmentIds: number[] | null,
): Promise<string> {
  const conditions = [gte(tickets.createdAt, from), lte(tickets.createdAt, to)];
  if (scopedDepartmentIds !== null) conditions.push(inArray(tickets.departmentId, scopedDepartmentIds));
=======
  scopedDepartmentId: number | null,
): Promise<string> {
  const conditions = [gte(tickets.createdAt, from), lte(tickets.createdAt, to)];
  if (scopedDepartmentId !== null) conditions.push(eq(tickets.departmentId, scopedDepartmentId));
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

  const rows = await db
    .select()
    .from(tickets)
    .where(and(...conditions))
    .orderBy(tickets.createdAt);

  const deptList = await db.select().from(departments);
  const deptNameById = new Map(deptList.map((d) => [d.id, d.name]));

  const csvRows = [
    ["Ticket ID", "Employee Code", "Department", "Title", "Status", "Created", "Updated", "Replies"],
  ];
  for (const t of rows) {
    const replyRows = await db.select().from(replies).where(eq(replies.ticketId, t.id));
    csvRows.push([
      t.id,
      t.employeeCode,
      deptNameById.get(t.departmentId) ?? "",
      t.title.replace(/[\r\n,]/g, " "),
      t.status,
      t.createdAt.toISOString(),
      t.updatedAt.toISOString(),
      String(replyRows.length),
    ]);
  }
  return toCsv(csvRows);
}
