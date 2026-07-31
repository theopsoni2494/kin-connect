import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, apiUpload } from "./api-client";
import { API_BASE_URL } from "./brand";
import { getAccessToken } from "./session";
import type {
  Department,
  Ticket,
  TicketStatus,
  Broadcast,
  Employee,
  Admin,
  Profile,
  Attachment,
  MediaKind,
} from "./types";

// --- Departments ---
export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: () => apiGet<Department[]>("/departments") });
}

// --- Attachments ---
export function useUploadAttachment() {
  return useMutation({
    mutationFn: async (input: { kind: MediaKind; file?: File | Blob; fileName?: string; text?: string }) => {
      if (input.kind === "text") {
        return apiPost<Attachment>("/attachments", { kind: "text", text: input.text });
      }
      const form = new FormData();
      form.append("kind", input.kind);
      form.append("file", input.file as Blob, input.fileName ?? "upload");
      return apiUpload<Attachment>("/attachments", form);
    },
  });
}

// --- Employee (front-end user) tickets ---
export function useMyTickets(status?: TicketStatus) {
  return useQuery({
    queryKey: ["my-tickets", status],
    queryFn: () => apiGet<Ticket[]>(`/employees/me/tickets${status ? `?status=${status}` : ""}`),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { departmentSlug: string; attachmentId: string }) =>
      apiPost<Ticket>("/tickets", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-tickets"] }),
  });
}

export function useReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ticketId: string; attachmentId: string }) =>
      apiPost<Ticket>(`/tickets/${input.ticketId}/replies`, { attachmentId: input.attachmentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-tickets"] }),
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => apiPost<void>(`/tickets/${ticketId}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-tickets"] }),
  });
}

// --- Admin tickets ---
export function useAdminTickets(status?: TicketStatus) {
  return useQuery({
    queryKey: ["admin-tickets", status],
    queryFn: () => apiGet<Ticket[]>(`/admin/tickets${status ? `?status=${status}` : ""}`),
  });
}

export function useAdminReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ticketId: string; attachmentId: string }) =>
      apiPost<Ticket>(`/admin/tickets/${input.ticketId}/replies`, { attachmentId: input.attachmentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tickets"] }),
  });
}

// --- Notifications (distinct from Broadcasts/Alerts — see notification-dots.tsx) ---
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      apiGet<{ id: string; message: string | null; ticketId: string | null; createdAt: string }[]>(
        "/notifications/me",
      ),
  });
}

// --- Broadcasts ---
export function useEmployeeBroadcasts() {
  return useQuery({
    queryKey: ["my-broadcasts"],
    queryFn: () => apiGet<Broadcast[]>("/employees/me/broadcasts"),
  });
}

export function useSentBroadcasts() {
  return useQuery({ queryKey: ["sent-broadcasts"], queryFn: () => apiGet<Broadcast[]>("/admin/broadcasts") });
}

export function useSendBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      targetType: "employee" | "department" | "all";
      targetEmployeeCode?: string;
      message: string;
      attachmentId?: string;
    }) => apiPost<{ id: string; recipientCount: number }>("/admin/broadcasts", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sent-broadcasts"] }),
  });
}

// --- Employees (credentials management) ---
export function useEmployees() {
  return useQuery({ queryKey: ["employees"], queryFn: () => apiGet<Employee[]>("/admin/employees") });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; whatsappNumber: string; label?: string; sector?: string | null }) =>
      apiPost<Employee>("/admin/employees", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; patch: Partial<Employee> }) =>
      apiPatch<Employee>(`/admin/employees/${input.code}`, input.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiDelete<void>(`/admin/employees/${code}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export interface BulkImportResult {
  created: string[];
  skippedExisting: string[];
  skippedInvalid: string[];
  updatedExisting: string[];
}

export function useBulkImportEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file, file.name);
      return apiUpload<BulkImportResult>("/admin/employees/bulk-import", form);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

// --- Admins (master-admin only) ---
export function useAdmins() {
  return useQuery({ queryKey: ["admins"], queryFn: () => apiGet<Admin[]>("/admin/admins") });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; name: string; isMaster: boolean; departmentIds?: number[] }) =>
      apiPost<Admin>("/admin/admins", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: { name?: string; isActive?: boolean; departmentIds?: number[] } }) =>
      apiPatch<Admin>(`/admin/admins/${input.id}`, input.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/admin/admins/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: (input: { id: string; newPassword: string }) =>
      apiPost<void>(`/admin/admins/${input.id}/reset-password`, { newPassword: input.newPassword }),
  });
}

// --- Profile ---
export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => apiGet<Profile>("/profiles/me") });
}

export function useSetProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Profile) => apiPatch<Profile>("/profiles/me", patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// Master-admin-only: view/edit another identifier's profile (e.g. an employee's office mail).
export function useAdminProfile(identifier: string, enabled: boolean) {
  return useQuery({
    queryKey: ["profile", identifier],
    queryFn: () => apiGet<Profile>(`/profiles/${identifier}`),
    enabled,
  });
}

export function useAdminSetProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { identifier: string; patch: Profile }) =>
      apiPatch<Profile>(`/profiles/${input.identifier}`, input.patch),
    onSuccess: (_, input) => qc.invalidateQueries({ queryKey: ["profile", input.identifier] }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file, file.name);
      return apiUpload<Profile>("/profiles/me/avatar", form);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// --- Password (self-service, both employees and admins) ---
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      apiPost<void>("/auth/change-password", input),
  });
}

// First-login-only: claims a passwordless account by setting its real password.
export function useSetInitialPassword() {
  return useMutation({
    mutationFn: (input: { newPassword: string }) => apiPost<void>("/auth/set-initial-password", input),
  });
}

// --- Export (Download Data) ---
export async function downloadTicketsCsv(from: Date, to: Date) {
  const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  const res = await fetch(`${API_BASE_URL}/admin/export/tickets.csv?${params}`, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
  });
  if (!res.ok) throw new Error("export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tickets-${to.toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
