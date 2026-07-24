import { eq, and, desc, isNull, isNotNull, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { tickets, replies, departments, attachments } from "../db/schema.js";
import { genTicketId } from "../utils/ids.js";
import { toAttachmentDto, type AttachmentDto } from "./attachment.service.js";
import { HttpError } from "../middleware/errorHandler.js";

export type TicketStatus = "open" | "pending" | "closed";

export interface TicketDto {
  id: string;
  employeeCode: string;
  departmentSlug: string;
  departmentName: string;
  status: TicketStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
  attachment: AttachmentDto;
  replies: {
    id: string;
    from: "user" | "admin";
    createdAt: string;
    attachment: AttachmentDto;
  }[];
}

async function departmentBySlug(slug: string) {
  const [d] = await db.select().from(departments).where(eq(departments.slug, slug)).limit(1);
  if (!d) throw new HttpError(400, `unknown department: ${slug}`);
  return d;
}

export async function createTicket(employeeCode: string, departmentSlug: string, attachmentId: string) {
  const [dept, attachment] = await Promise.all([
    departmentBySlug(departmentSlug),
    db.query.attachments.findFirst({ where: eq(attachments.id, attachmentId) }),
  ]);
  if (!attachment) throw new HttpError(400, "attachment not found");

  const title =
    attachment.kind === "text" && attachment.textContent
      ? attachment.textContent.slice(0, 80)
      : `${dept.name} — ${attachment.kind} report`;

  const [ticket] = await db
    .insert(tickets)
    .values({
      id: genTicketId(),
      employeeCode: employeeCode.trim().toUpperCase(),
      departmentId: dept.id,
      title,
      attachmentId,
    })
    .returning();
  return ticket;
}

export async function addReply(
  ticketId: string,
  fromRole: "user" | "admin",
  attachmentId: string,
  options: { adminId?: string; requireEmployeeCode?: string } = {},
) {
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, ticketId) });
  if (!ticket) throw new HttpError(404, "ticket not found");
  if (options.requireEmployeeCode && ticket.employeeCode !== options.requireEmployeeCode) {
    throw new HttpError(404, "ticket not found");
  }

  const [reply] = await db
    .insert(replies)
    .values({ ticketId, fromRole, attachmentId, adminId: options.adminId })
    .returning();

  await db
    .update(tickets)
    .set({ status: "pending", updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  return { reply, ticket };
}

export async function closeTicket(ticketId: string, closedByEmployeeCode: string) {
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, ticketId) });
  if (!ticket) throw new HttpError(404, "ticket not found");
  if (ticket.employeeCode !== closedByEmployeeCode.trim().toUpperCase()) {
    throw new HttpError(404, "ticket not found");
  }
  await db
    .update(tickets)
    .set({ status: "closed", closedAt: new Date(), closedBy: closedByEmployeeCode, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));
  return ticket;
}

export async function listTicketsForEmployee(employeeCode: string, status?: TicketStatus) {
  const code = employeeCode.trim().toUpperCase();
  const rows = await db.query.tickets.findMany({
    where: status
      ? and(eq(tickets.employeeCode, code), eq(tickets.status, status))
      : eq(tickets.employeeCode, code),
    orderBy: desc(tickets.updatedAt),
  });
  return Promise.all(rows.map(toTicketDto));
}

export async function listTicketsForAdmin(scopedDepartmentIds: number[] | null, status?: TicketStatus) {
  const conditions = [] as any[];
  if (scopedDepartmentIds !== null) conditions.push(inArray(tickets.departmentId, scopedDepartmentIds));
  if (status) conditions.push(eq(tickets.status, status));
  const rows = await db.query.tickets.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: desc(tickets.createdAt),
  });
  return Promise.all(rows.map(toTicketDto));
}

export async function getTicketScoped(ticketId: string, scopedDepartmentIds: number[] | null) {
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, ticketId) });
  if (!ticket) throw new HttpError(404, "ticket not found");
  if (scopedDepartmentIds !== null && !scopedDepartmentIds.includes(ticket.departmentId)) {
    throw new HttpError(404, "ticket not found");
  }
  return toTicketDto(ticket);
}

async function toTicketDto(ticket: typeof tickets.$inferSelect): Promise<TicketDto> {
  const [[dept], attachment, replyRows] = await Promise.all([
    db.select().from(departments).where(eq(departments.id, ticket.departmentId)).limit(1),
    db.query.attachments.findFirst({ where: eq(attachments.id, ticket.attachmentId) }),
    db.query.replies.findMany({
      where: eq(replies.ticketId, ticket.id),
      orderBy: replies.createdAt,
    }),
  ]);
  const replyDtos = await Promise.all(
    replyRows.map(async (r) => {
      const a = await db.query.attachments.findFirst({ where: eq(attachments.id, r.attachmentId) });
      return {
        id: r.id,
        from: r.fromRole as "user" | "admin",
        createdAt: r.createdAt.toISOString(),
        attachment: a ? await toAttachmentDto(a) : { id: r.attachmentId, kind: "text" as const },
      };
    }),
  );

  return {
    id: ticket.id,
    employeeCode: ticket.employeeCode,
    departmentSlug: dept?.slug ?? "",
    departmentName: dept?.name ?? "",
    status: ticket.status as TicketStatus,
    title: ticket.title,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    attachment: attachment ? await toAttachmentDto(attachment) : { id: ticket.attachmentId, kind: "text" },
    replies: replyDtos,
  };
}
