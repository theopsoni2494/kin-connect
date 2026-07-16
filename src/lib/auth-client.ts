import { apiPost } from "./api-client";
import { setTokens, setSession, clearSession, getRefreshToken } from "./session";

export async function loginEmployee(code: string, password: string) {
  const data = await apiPost<{
    accessToken: string;
    refreshToken: string;
    employee: { code: string; label?: string | null };
  }>("/auth/employee/login", { code, password });
  setTokens(data.accessToken, data.refreshToken);
  setSession({
    role: "employee",
    name: data.employee.label || data.employee.code,
    identifier: data.employee.code,
  });
  return data.employee;
}

export async function loginAdmin(code: string, password: string) {
  const data = await apiPost<{
    accessToken: string;
    refreshToken: string;
    admin: { id: string; code: string; name: string; isMaster: boolean };
    department: { id: number; name: string } | null;
  }>("/auth/admin/login", { code, password });
  setTokens(data.accessToken, data.refreshToken);
  setSession({
    role: "admin",
    name: data.admin.name,
    identifier: data.admin.id,
    code: data.admin.code,
    isMaster: data.admin.isMaster,
    departmentId: data.department?.id,
    departmentName: data.department?.name,
  });
  return { admin: data.admin };
}

export async function resetEmployeePassword(employeeCode: string, newPassword: string) {
  await apiPost<void>("/auth/admin/reset-employee-password", { employeeCode, newPassword });
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await apiPost("/auth/logout", { refreshToken }).catch(() => undefined);
  }
  clearSession();
}
