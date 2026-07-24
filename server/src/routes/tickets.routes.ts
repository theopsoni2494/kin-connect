import { Router } from "express";
<<<<<<< HEAD
import { requireAuth, requireEmployee, requirePasswordSet, type AuthedRequest } from "../middleware/requireAuth.js";
=======
import { requireAuth, requireEmployee, type AuthedRequest } from "../middleware/requireAuth.js";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { createTicketSchema, addReplySchema } from "../utils/validation.js";
import {
  createTicket,
  addReply,
  closeTicket,
  listTicketsForEmployee,
  getTicketScoped,
} from "../services/ticket.service.js";
import { db } from "../db/client.js";
import { departments, adminDepartments } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { emitTicketCreated, emitTicketReplied, emitTicketClosed } from "../sockets/emit.js";
import { dispatchNotification } from "../notifications/dispatcher.js";
import { renderMessage } from "../notifications/templates.js";

export const ticketsRouter = Router();

<<<<<<< HEAD
ticketsRouter.use(requireAuth, requirePasswordSet, requireEmployee);
=======
ticketsRouter.use(requireAuth, requireEmployee);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

ticketsRouter.get(
  "/employees/me/tickets",
  asyncHandler(async (req: AuthedRequest, res) => {
    const status = req.query.status as "open" | "pending" | "closed" | undefined;
    const rows = await listTicketsForEmployee(req.auth!.sub, status);
    res.json(rows);
  }),
);

ticketsRouter.post(
  "/tickets",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { departmentSlug, attachmentId } = createTicketSchema.parse(req.body);
    const ticket = await createTicket(req.auth!.sub, departmentSlug, attachmentId);
    const [dept] = await db.select().from(departments).where(eq(departments.id, ticket.departmentId)).limit(1);

    const deptAdmins = await db
      .select({ adminId: adminDepartments.adminId })
      .from(adminDepartments)
      .where(eq(adminDepartments.departmentId, ticket.departmentId));
    const adminMessage = `You have a new query from Employee ID: ${ticket.employeeCode}. Kindly address it.`;

    emitTicketCreated({
      ticketId: ticket.id,
      employeeCode: ticket.employeeCode,
      departmentId: ticket.departmentId,
      title: ticket.title,
      createdAt: ticket.createdAt.toISOString(),
      adminMessage,
    });
    dispatchNotification({
      eventType: "ticket_created",
      ticketId: ticket.id,
      recipient: { type: "employee", code: ticket.employeeCode },
      message: renderMessage("ticket_created", { ticketId: ticket.id, departmentName: dept?.name }),
    }).catch((err) => console.error("notification dispatch failed", err));

    // Notify the department's assigned admin(s) — this is what powers their
    // in-app pop-up + sound + the Notifications tab, distinct from the
    // employee-facing confirmation dispatched above.
    for (const { adminId } of deptAdmins) {
      dispatchNotification({
        eventType: "ticket_created",
        ticketId: ticket.id,
        recipient: { type: "admin", id: adminId },
        message: adminMessage,
      }).catch((err) => console.error("notification dispatch failed", err));
    }

    res.status(201).json(await getTicketScoped(ticket.id, null));
  }),
);

ticketsRouter.post(
  "/tickets/:id/replies",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { attachmentId } = addReplySchema.parse(req.body);
    const { ticket } = await addReply(req.params.id, "user", attachmentId, {
      requireEmployeeCode: req.auth!.sub,
    });

    emitTicketReplied({
      ticketId: ticket.id,
      from: "user",
      employeeCode: ticket.employeeCode,
      departmentId: ticket.departmentId,
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json(await getTicketScoped(ticket.id, null));
  }),
);

ticketsRouter.post(
  "/tickets/:id/close",
  asyncHandler(async (req: AuthedRequest, res) => {
    const ticket = await closeTicket(req.params.id, req.auth!.sub);

    emitTicketClosed({
      ticketId: ticket.id,
      employeeCode: ticket.employeeCode,
      departmentId: ticket.departmentId,
      closedAt: new Date().toISOString(),
    });
    dispatchNotification({
      eventType: "ticket_closed",
      ticketId: ticket.id,
      recipient: { type: "employee", code: ticket.employeeCode },
      message: renderMessage("ticket_closed", { ticketId: ticket.id }),
    }).catch((err) => console.error("notification dispatch failed", err));

    res.status(204).end();
  }),
);
