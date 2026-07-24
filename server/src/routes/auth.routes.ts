import { Router } from "express";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { requireMasterAdmin } from "../middleware/requireAdminDepartment.js";
import {
  employeeLoginSchema,
  adminLoginSchema,
  refreshSchema,
  resetEmployeePasswordSchema,
  changePasswordSchema,
<<<<<<< HEAD
  setInitialPasswordSchema,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
} from "../utils/validation.js";
import {
  loginEmployee,
  loginAdmin,
  refreshSession,
  revokeRefreshToken,
  resetEmployeePassword,
  changeOwnPassword,
<<<<<<< HEAD
  setInitialPassword,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
} from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/employee/login",
  asyncHandler(async (req, res) => {
    const { code, password } = employeeLoginSchema.parse(req.body);
    const result = await loginEmployee(code, password);
    if (!result) throw new HttpError(401, "invalid employee code or password");
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      employee: { code: result.employee.code, label: result.employee.label },
<<<<<<< HEAD
      mustSetPassword: result.mustSetPassword,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    });
  }),
);

authRouter.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const { code, password } = adminLoginSchema.parse(req.body);
    const result = await loginAdmin(code, password);
    if (!result) throw new HttpError(401, "invalid admin code or password");
    if (result === "no-department") {
      throw new HttpError(403, "this admin account has no department assigned — contact the master admin");
    }

    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      admin: {
        id: result.admin.id,
        code: result.admin.code,
        name: result.admin.name,
        isMaster: result.admin.isMaster,
      },
<<<<<<< HEAD
      departments: result.departments,
      mustSetPassword: result.mustSetPassword,
=======
      department: result.department,
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshSession(refreshToken);
    if (!result) throw new HttpError(401, "invalid or expired refresh token");
    res.json(result);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    await revokeRefreshToken(refreshToken);
    res.status(204).end();
  }),
);

authRouter.post(
  "/admin/reset-employee-password",
  requireAuth,
  requireMasterAdmin,
  asyncHandler(async (req, res) => {
    const { employeeCode, newPassword } = resetEmployeePasswordSchema.parse(req.body);
    await resetEmployeePassword(employeeCode, newPassword);
    res.status(204).end();
  }),
);

authRouter.post(
  "/change-password",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const ok = await changeOwnPassword(req.auth!, currentPassword, newPassword);
    if (!ok) throw new HttpError(401, "current password is incorrect");
    res.status(204).end();
  }),
);
<<<<<<< HEAD

// First-login-only: claims a passwordless account. Deliberately NOT gated by
// requirePasswordSet (this IS the escape hatch it blocks everything else
// behind) — setInitialPassword itself rejects if a password is already set.
authRouter.post(
  "/set-initial-password",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { newPassword } = setInitialPasswordSchema.parse(req.body);
    const ok = await setInitialPassword(req.auth!, newPassword);
    if (!ok) throw new HttpError(409, "a password is already set for this account");
    res.status(204).end();
  }),
);
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
