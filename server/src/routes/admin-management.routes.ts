import { Router } from "express";
import { requireAuth, requirePasswordSet } from "../middleware/requireAuth.js";
import { requireMasterAdmin } from "../middleware/requireAdminDepartment.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { createAdminSchema, updateAdminSchema, resetAdminPasswordSchema } from "../utils/validation.js";
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, resetAdminPassword } from "../services/admin-management.service.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";

export const adminManagementRouter = Router();

adminManagementRouter.use(requireAuth, requirePasswordSet, requireMasterAdmin);

adminManagementRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listAdmins());
  }),
);

adminManagementRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createAdminSchema.parse(req.body);
    const admin = await createAdmin(input);
    res.status(201).json(admin);
  }),
);

adminManagementRouter.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const patch = updateAdminSchema.parse(req.body);
    if (patch.isActive === false && req.params.id === req.auth!.sub) {
      throw new HttpError(400, "cannot freeze your own account");
    }
    const admin = await updateAdmin(req.params.id, patch);
    res.json(admin);
  }),
);

adminManagementRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    if (req.params.id === req.auth!.sub) {
      throw new HttpError(400, "cannot delete your own account");
    }
    await deleteAdmin(req.params.id);
    res.status(204).end();
  }),
);

adminManagementRouter.post(
  "/:id/reset-password",
  asyncHandler(async (req, res) => {
    const { newPassword } = resetAdminPasswordSchema.parse(req.body);
    await resetAdminPassword(req.params.id, newPassword);
    res.status(204).end();
  }),
);
