import { Router } from "express";
<<<<<<< HEAD
import { requireAuth, requirePasswordSet, type AuthedRequest } from "../middleware/requireAuth.js";
=======
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dateRangeQuerySchema } from "../utils/validation.js";
import { exportTicketsCsv } from "../services/export.service.js";

export const exportRouter = Router();

<<<<<<< HEAD
exportRouter.use(requireAuth, requirePasswordSet, requireAdminDepartment);
=======
exportRouter.use(requireAuth, requireAdminDepartment);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

exportRouter.get(
  "/tickets.csv",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { from, to } = dateRangeQuerySchema.parse(req.query);
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

<<<<<<< HEAD
    const csv = await exportTicketsCsv(fromDate, toDate, req.scopedDepartmentIds ?? null);
=======
    const csv = await exportTicketsCsv(fromDate, toDate, req.scopedDepartmentId ?? null);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tickets-${toDate.toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  }),
);
