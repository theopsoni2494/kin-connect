export interface Department {
  id: number;
  slug: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export type MediaKind = "text" | "voice" | "video" | "photo" | "file";

export interface Attachment {
  id: string;
  kind: MediaKind;
  name?: string | null;
  mimeType?: string | null;
  text?: string | null;
  url?: string | null;
}

export interface Reply {
  id: string;
  from: "user" | "admin";
  createdAt: string;
  attachment: Attachment;
}

export type TicketStatus = "open" | "pending" | "closed";

export interface Ticket {
  id: string;
  employeeCode: string;
  departmentSlug: string;
  departmentName: string;
  status: TicketStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
  attachment: Attachment;
  replies: Reply[];
}

export interface Broadcast {
  id: string;
  targetType: "employee" | "department" | "all";
  targetEmployeeCode?: string | null;
  targetDepartmentId?: number | null;
  message: string;
  createdAt: string;
  attachment?: Attachment | null;
  recipientCount: number;
}

export interface Employee {
  code: string;
  label?: string | null;
  whatsappNumber?: string | null;
  isActive?: boolean;
}

export interface Admin {
  id: string;
  code: string;
  name: string;
  isMaster: boolean;
  isActive: boolean;
<<<<<<< HEAD
  departments: { id: number; name: string }[];
=======
  departmentId: number | null;
  departmentName: string | null;
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
}

export interface Profile {
  identifier?: string;
  name?: string | null;
  phone?: string | null;
  officeMail?: string | null;
  avatarUrl?: string | null;
}

export type Role = "employee" | "admin";

export interface Session {
  role: Role;
  name: string;
  identifier: string; // employee code, or admin uuid id (used for self-comparisons)
  code?: string; // admin's login code (KN-xx) — display only
<<<<<<< HEAD
  departments?: { id: number; name: string }[];
  isMaster?: boolean;
  // Passwordless first login hasn't been claimed yet — dashboard/admin
  // shells redirect to /set-password until this is cleared.
  mustSetPassword?: boolean;
=======
  departmentId?: number;
  departmentName?: string;
  isMaster?: boolean;
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
}
