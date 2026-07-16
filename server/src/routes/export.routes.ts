import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dateRangeQuerySchema } from "../utils/validation.js";
import { exportTicketsCsv } from "../services/export.service.js";

export const exportRouter = Router();

exportRouter.use(requireAuth, requireAdminDepartment);

exportRouter.get(
  "/tickets.csv",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { from, to } = dateRangeQuerySchema.parse(req.query);
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const csv = await exportTicketsCsv(fromDate, toDate, req.scopedDepartmentId ?? null);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tickets-${toDate.toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  }),
);
