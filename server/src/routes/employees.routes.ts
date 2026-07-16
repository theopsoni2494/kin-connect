import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../utils/validation.js";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "../services/employee.service.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth, requireAdminDepartment);

employeesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await listEmployees();
    res.json(rows.map((e) => ({ code: e.code, label: e.label, whatsappNumber: e.whatsappNumber, isActive: e.isActive })));
  }),
);

employeesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { code, whatsappNumber, label } = createEmployeeSchema.parse(req.body);
    const row = await createEmployee(code, whatsappNumber, label);
    res.status(201).json({ code: row.code, label: row.label, whatsappNumber: row.whatsappNumber });
  }),
);

employeesRouter.patch(
  "/:code",
  asyncHandler(async (req, res) => {
    const patch = updateEmployeeSchema.parse(req.body);
    const row = await updateEmployee(req.params.code, patch);
    res.json({ code: row.code, label: row.label, whatsappNumber: row.whatsappNumber, isActive: row.isActive });
  }),
);

employeesRouter.delete(
  "/:code",
  asyncHandler(async (req, res) => {
    await deleteEmployee(req.params.code);
    res.status(204).end();
  }),
);
