import { Router } from "express";
<<<<<<< HEAD
import { requireAuth, requireEmployee, requirePasswordSet, type AuthedRequest } from "../middleware/requireAuth.js";
=======
import { requireAuth, requireEmployee, type AuthedRequest } from "../middleware/requireAuth.js";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { sendBroadcastSchema } from "../utils/validation.js";
import {
  sendBroadcast,
  listBroadcastsForEmployee,
  listSentBroadcasts,
} from "../services/broadcast.service.js";
import { emitBroadcastSent } from "../sockets/emit.js";
import { dispatchNotification } from "../notifications/dispatcher.js";
import { renderMessage } from "../notifications/templates.js";

export const employeeBroadcastsRouter = Router();
<<<<<<< HEAD
employeeBroadcastsRouter.use(requireAuth, requirePasswordSet, requireEmployee);
=======
employeeBroadcastsRouter.use(requireAuth, requireEmployee);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
employeeBroadcastsRouter.get(
  "/employees/me/broadcasts",
  asyncHandler(async (req: AuthedRequest, res) => {
    const rows = await listBroadcastsForEmployee(req.auth!.sub);
    res.json(rows);
  }),
);

export const adminBroadcastsRouter = Router();
<<<<<<< HEAD
adminBroadcastsRouter.use(requireAuth, requirePasswordSet, requireAdminDepartment);
=======
adminBroadcastsRouter.use(requireAuth, requireAdminDepartment);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

adminBroadcastsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    // Non-master admins see only broadcasts they personally sent; master sees all.
    const rows = await listSentBroadcasts(req.auth!.isMaster ? null : req.auth!.sub);
    res.json(rows);
  }),
);

adminBroadcastsRouter.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { targetType, targetEmployeeCode, message, attachmentId } = sendBroadcastSchema.parse(
      req.body,
    );
    if (targetType === "all" && !req.auth!.isMaster) {
      throw new HttpError(403, "only master admins can broadcast to all employees");
    }
    const { broadcast, recipients } = await sendBroadcast(
      req.auth!.sub,
      targetType,
      message,
<<<<<<< HEAD
      req.scopedDepartmentIds ?? null,
=======
      req.scopedDepartmentId ?? null,
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      targetEmployeeCode,
      attachmentId,
    );

    emitBroadcastSent({
      broadcastId: broadcast.id,
      targetType: broadcast.targetType,
      targetEmployeeCode: broadcast.targetEmployeeCode,
      targetDepartmentId: broadcast.targetDepartmentId,
      message: broadcast.message,
      createdAt: broadcast.createdAt.toISOString(),
      recipients,
    });

    for (const code of recipients) {
      dispatchNotification({
        eventType: "broadcast_sent",
        broadcastId: broadcast.id,
        recipient: { type: "employee", code },
        message: renderMessage("broadcast_sent", { broadcastMessage: message }),
      }).catch((err) => console.error("notification dispatch failed", err));
    }

    res.status(201).json({ id: broadcast.id, recipientCount: recipients.length });
  }),
);
