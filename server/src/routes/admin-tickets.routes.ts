import { Router } from "express";
<<<<<<< HEAD
import { requireAuth, requirePasswordSet } from "../middleware/requireAuth.js";
=======
import { requireAuth } from "../middleware/requireAuth.js";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
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

<<<<<<< HEAD
adminTicketsRouter.use(requireAuth, requirePasswordSet, requireAdminDepartment);
=======
adminTicketsRouter.use(requireAuth, requireAdminDepartment);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

adminTicketsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const status = req.query.status as TicketStatus | undefined;
<<<<<<< HEAD
    const rows = await listTicketsForAdmin(req.scopedDepartmentIds ?? null, status);
=======
    const rows = await listTicketsForAdmin(req.scopedDepartmentId ?? null, status);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    res.json(rows);
  }),
);

adminTicketsRouter.get(
  "/titles",
  asyncHandler(async (req: AuthedRequest, res) => {
<<<<<<< HEAD
    const rows = await listTicketsForAdmin(req.scopedDepartmentIds ?? null);
=======
    const rows = await listTicketsForAdmin(req.scopedDepartmentId ?? null);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    res.json(rows.map((t) => ({ id: t.id, title: t.title, departmentName: t.departmentName, status: t.status })));
  }),
);

adminTicketsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
<<<<<<< HEAD
    const ticket = await getTicketScoped(req.params.id, req.scopedDepartmentIds ?? null);
=======
    const ticket = await getTicketScoped(req.params.id, req.scopedDepartmentId ?? null);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
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
<<<<<<< HEAD
    await getTicketScoped(req.params.id, req.scopedDepartmentIds ?? null);
=======
    await getTicketScoped(req.params.id, req.scopedDepartmentId ?? null);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
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

<<<<<<< HEAD
    res.status(201).json(await getTicketScoped(ticket.id, req.scopedDepartmentIds ?? null));
=======
    res.status(201).json(await getTicketScoped(ticket.id, req.scopedDepartmentId ?? null));
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  }),
);
