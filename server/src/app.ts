import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { departmentsRouter } from "./routes/departments.routes.js";
import { employeesRouter } from "./routes/employees.routes.js";
import { attachmentsRouter } from "./routes/attachments.routes.js";
import { ticketsRouter } from "./routes/tickets.routes.js";
import { adminTicketsRouter } from "./routes/admin-tickets.routes.js";
import { employeeBroadcastsRouter, adminBroadcastsRouter } from "./routes/broadcasts.routes.js";
import { profilesRouter } from "./routes/profiles.routes.js";
import { exportRouter } from "./routes/export.routes.js";
import { adminManagementRouter } from "./routes/admin-management.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true, brand: config.BRAND_NAME }));

  app.use("/v1/auth", authRouter);
  app.use("/v1/departments", departmentsRouter);
  app.use("/v1/admin/employees", employeesRouter);
  app.use("/v1/attachments", attachmentsRouter);
  // Admin/profile/export routers must be registered before the two broadly-mounted
  // "/v1" routers below — those apply an unconditional requireEmployee gate that
  // would otherwise intercept and 403 every /v1/admin/* and /v1/profiles/* request.
  app.use("/v1/admin/tickets", adminTicketsRouter);
  app.use("/v1/admin/broadcasts", adminBroadcastsRouter);
  app.use("/v1/admin/admins", adminManagementRouter);
  app.use("/v1/notifications", notificationsRouter);
  app.use("/v1/profiles", profilesRouter);
  app.use("/v1/admin/export", exportRouter);
  app.use("/v1", ticketsRouter); // exposes /v1/employees/me/tickets, /v1/tickets*
  app.use("/v1", employeeBroadcastsRouter); // exposes /v1/employees/me/broadcasts

  app.use(errorHandler);

  return app;
}
