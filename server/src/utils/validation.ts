import { z } from "zod";

export const employeeLoginSchema = z.object({
  code: z.string().trim().min(1),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  code: z.string().trim().min(1),
  password: z.string().min(1),
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

export const createAdminSchema = z
  .object({
    code: z.string().trim().min(1),
    password: z.string().min(4),
    name: z.string().trim().min(1),
    isMaster: z.boolean().optional().default(false),
    departmentId: z.coerce.number().int().positive().optional(),
  })
  .refine((v) => v.isMaster || v.departmentId !== undefined, {
    message: "departmentId is required for non-master admins",
    path: ["departmentId"],
  });

export const updateAdminSchema = z.object({
  name: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
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
