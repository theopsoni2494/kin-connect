import { Router } from "express";
import { requireAuth, requirePasswordSet } from "../middleware/requireAuth.js";
import { requireAdminDepartment } from "../middleware/requireAdminDepartment.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { upload } from "../middleware/upload.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../utils/validation.js";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, bulkCreateEmployees } from "../services/employee.service.js";
import { extractEmployeeCodes } from "../utils/spreadsheet.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth, requirePasswordSet, requireAdminDepartment);

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

employeesRouter.post(
  "/bulk-import",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "file is required");
    const codes = extractEmployeeCodes(req.file.buffer);
    if (codes.length === 0) {
      throw new HttpError(400, "no employee codes found in the file — check the column header (e.g. \"EMP CODE\")");
    }
    const result = await bulkCreateEmployees(codes);
    res.json(result);
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
