import { Router } from "express";
import { and, eq, desc } from "drizzle-orm";
import { requireAuth, requirePasswordSet, type AuthedRequest } from "../middleware/requireAuth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { db } from "../db/client.js";
import { notifications } from "../db/schema.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, requirePasswordSet);

// Strictly scoped to the two events product wants surfaced in the
// Notifications tab — ticket_created for admins (new query in their
// department) and ticket_replied for employees (admin responded). Alerts
// (broadcast_sent) intentionally never appear here — those live only in the
// Alerts tab, per the "don't mix them" requirement.
notificationsRouter.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const auth = req.auth!;
    const rows =
      auth.role === "employee"
        ? await db
            .select()
            .from(notifications)
            .where(
              and(
                eq(notifications.recipientType, "employee"),
                eq(notifications.recipientEmployeeCode, auth.sub),
                eq(notifications.eventType, "ticket_replied"),
                eq(notifications.channel, "inapp"),
              ),
            )
            .orderBy(desc(notifications.createdAt))
            .limit(50)
        : auth.role === "admin"
          ? await db
              .select()
              .from(notifications)
              .where(
                and(
                  eq(notifications.recipientType, "admin"),
                  eq(notifications.recipientAdminId, auth.sub),
                  eq(notifications.eventType, "ticket_created"),
                  eq(notifications.channel, "inapp"),
                ),
              )
              .orderBy(desc(notifications.createdAt))
              .limit(50)
          : (() => {
              throw new HttpError(403, "unsupported role");
            })();

    res.json(
      rows.map((r) => ({
        id: r.id,
        message: r.message,
        ticketId: r.ticketId,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  }),
);
