import type { Server as HttpServer } from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { config } from "../config/env.js";
import { verifyAccessToken } from "../services/auth.service.js";
import { db } from "../db/client.js";
import { departments } from "../db/schema.js";

let io: SocketIoServer | null = null;

export function initSockets(httpServer: HttpServer): SocketIoServer {
  io = new SocketIoServer(httpServer, {
    cors: { origin: config.CORS_ORIGIN },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("missing auth token"));
    try {
      const claims = verifyAccessToken(token);
      socket.data.claims = claims;
      next();
    } catch {
      next(new Error("invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const claims = socket.data.claims as ReturnType<typeof verifyAccessToken>;
    if (claims.role === "employee") {
      socket.join(`employee:${claims.sub}`);
    } else if (claims.role === "admin") {
      if (claims.isMaster) {
        // Master admins see every department's events — join every room.
        db.select({ id: departments.id })
          .from(departments)
          .then((rows) => rows.forEach((d) => socket.join(`admin:department:${d.id}`)))
          .catch((err) => console.error("failed to join admin rooms", err));
      } else if (claims.departmentIds) {
        // Non-master admin, one or more assigned departments (baked into the
        // token at login) — join a room per department, no DB query needed.
        claims.departmentIds.forEach((id) => socket.join(`admin:department:${id}`));
      }
    }
  });

  return io;
}

export function getIo(): SocketIoServer {
  if (!io) throw new Error("sockets not initialized");
  return io;
}
