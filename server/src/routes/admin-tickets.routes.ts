import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { addReplySchema } from "../utils/validation.js";
import {
  listTicketsForAdmin,
  getTicketScoped,
  addReply,
  type TicketStatus,
} from "../services/ticket.service.js";
import { emitTicketReplied } from "../sockets/emit.js";
import { dispatchNotification } from "../notifications/dispatcher.js";
import { renderMessage } from "../notifications/templates.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";

export const adminTicketsRouter = Router();

adminTicketsRouter.use(requireAuth, requireAdminDepartment);

adminTicketsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const status = req.query.status as TicketStatus | undefined;
    const rows = await listTicketsForAdmin(req.scopedDepartmentId ?? null, status);
    res.json(rows);
  }),
);

adminTicketsRouter.get(
  "/titles",
  asyncHandler(async (req: AuthedRequest, res) => {
    const rows = await listTicketsForAdmin(req.scopedDepartmentId ?? null);
    res.json(rows.map((t) => ({ id: t.id, title: t.title, departmentName: t.departmentName, status: t.status })));
  }),
);

adminTicketsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const ticket = await getTicketScoped(req.params.id, req.scopedDepartmentId ?? null);
    res.json(ticket);
  }),
);

// No admin close-ticket route exists: closing a query is intentionally
// employee-only (see tickets.routes.ts POST /tickets/:id/close).
adminTicketsRouter.post(
  "/:id/replies",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { attachmentId } = addReplySchema.parse(req.body);
    // getTicketScoped enforces department scoping (404 on mismatch) before we touch it.
    await getTicketScoped(req.params.id, req.scopedDepartmentId ?? null);
    const { ticket } = await addReply(req.params.id, "admin", attachmentId, {
      adminId: req.auth!.sub,
    });

    const replyMessage = renderMessage("ticket_replied", { ticketId: ticket.id });

    emitTicketReplied({
      ticketId: ticket.id,
      from: "admin",
      employeeCode: ticket.employeeCode,
      departmentId: ticket.departmentId,
      updatedAt: new Date().toISOString(),
      message: replyMessage,
    });
    dispatchNotification({
      eventType: "ticket_replied",
      ticketId: ticket.id,
      recipient: { type: "employee", code: ticket.employeeCode },
      message: replyMessage,
    }).catch((err) => console.error("notification dispatch failed", err));

    res.status(201).json(await getTicketScoped(ticket.id, req.scopedDepartmentId ?? null));
  }),
);
