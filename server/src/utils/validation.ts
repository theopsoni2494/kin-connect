import { z } from "zod";

// password allows empty string: a not-yet-claimed account's first login
// skips the password check entirely (see loginEmployee/loginAdmin).
export const employeeLoginSchema = z.object({
  code: z.string().trim().min(1),
  password: z.string(),
});

export const adminLoginSchema = z.object({
  code: z.string().trim().min(1),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resetEmployeePasswordSchema = z.object({
  employeeCode: z.string().trim().min(1),
  newPassword: z.string().min(4),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(4),
});

export const setInitialPasswordSchema = z.object({
  newPassword: z.string().min(4),
});

export const createTicketSchema = z.object({
  departmentSlug: z.string().min(1),
  attachmentId: z.string().uuid(),
});

export const addReplySchema = z.object({
  attachmentId: z.string().uuid(),
});

export const createEmployeeSchema = z.object({
  code: z.string().trim().min(1),
  whatsappNumber: z.string().trim().min(6),
  label: z.string().trim().optional(),
});

export const updateEmployeeSchema = z.object({
  label: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const sendBroadcastSchema = z.object({
  targetType: z.enum(["employee", "department", "all"]),
  targetEmployeeCode: z.string().trim().optional(),
  message: z.string().trim().min(1),
  attachmentId: z.string().uuid().optional(),
});

// No password field — new admins are created unclaimed (passwordless first
// login, then forced to set their own password — see auth.service.ts).
// departmentIds accepts one or many — a non-master admin can now be assigned
// any subset of departments (see admin-management.service.ts).
export const createAdminSchema = z
  .object({
    code: z.string().trim().min(1),
    name: z.string().trim().min(1),
    isMaster: z.boolean().optional().default(false),
    departmentIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .refine((v) => v.isMaster || (v.departmentIds && v.departmentIds.length > 0), {
    message: "at least one department is required for non-master admins",
    path: ["departmentIds"],
  });

export const updateAdminSchema = z.object({
  name: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  departmentIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const resetAdminPasswordSchema = z.object({
  newPassword: z.string().min(4),
});

export const setProfileSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  officeMail: z.string().trim().optional(),
});

export const dateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
