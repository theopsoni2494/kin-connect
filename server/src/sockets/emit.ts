import { getIo } from "./index.js";

export function emitTicketCreated(params: {
  ticketId: string;
  employeeCode: string;
  departmentId: number;
  title: string;
  createdAt: string;
  adminMessage?: string;
}) {
  getIo().to(`admin:department:${params.departmentId}`).emit("ticket:created", params);
}

export function emitTicketReplied(params: {
  ticketId: string;
  from: "user" | "admin";
  employeeCode: string;
  departmentId: number;
  updatedAt: string;
  message?: string;
}) {
  const io = getIo();
  if (params.from === "admin") {
    io.to(`employee:${params.employeeCode}`).emit("ticket:replied", params);
  } else {
    io.to(`admin:department:${params.departmentId}`).emit("ticket:replied", params);
  }
}

export function emitTicketClosed(params: {
  ticketId: string;
  employeeCode: string;
  departmentId: number;
  closedAt: string;
}) {
  getIo().to(`admin:department:${params.departmentId}`).emit("ticket:closed", params);
}

export function emitBroadcastSent(params: {
  broadcastId: string;
  targetType: string;
  targetEmployeeCode?: string | null;
  targetDepartmentId?: number | null;
  message: string;
  createdAt: string;
  recipients: string[];
}) {
  const io = getIo();
  for (const code of params.recipients) {
    io.to(`employee:${code}`).emit("broadcast:sent", params);
  }
}
