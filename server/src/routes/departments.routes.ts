import { Router } from "express";
import { db } from "../db/client.js";
import { departments } from "../db/schema.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const departmentsRouter = Router();

departmentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(departments).orderBy(departments.sortOrder);
    res.json(rows);
  }),
);
