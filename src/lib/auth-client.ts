import { apiPost } from "./api-client";
import { setTokens, setSession, clearSession, getRefreshToken } from "./session";

export async function loginEmployee(code: string, password: string) {
  const data = await apiPost<{
    accessToken: string;
    refreshToken: string;
    employee: { code: string; label?: string | null };
<<<<<<< HEAD
    mustSetPassword: boolean;
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  }>("/auth/employee/login", { code, password });
  setTokens(data.accessToken, data.refreshToken);
  setSession({
    role: "employee",
    name: data.employee.label || data.employee.code,
    identifier: data.employee.code,
<<<<<<< HEAD
    mustSetPassword: data.mustSetPassword,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  });
  return data.employee;
}

export async function loginAdmin(code: string, password: string) {
  const data = await apiPost<{
    accessToken: string;
    refreshToken: string;
    admin: { id: string; code: string; name: string; isMaster: boolean };
<<<<<<< HEAD
    departments: { id: number; name: string }[];
    mustSetPassword: boolean;
=======
    department: { id: number; name: string } | null;
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  }>("/auth/admin/login", { code, password });
  setTokens(data.accessToken, data.refreshToken);
  setSession({
    role: "admin",
    name: data.admin.name,
    identifier: data.admin.id,
    code: data.admin.code,
    isMaster: data.admin.isMaster,
<<<<<<< HEAD
    departments: data.departments,
    mustSetPassword: data.mustSetPassword,
=======
    departmentId: data.department?.id,
    departmentName: data.department?.name,
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
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
