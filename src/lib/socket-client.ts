import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./brand";
import { getAccessToken } from "./session";

let socket: Socket | null = null;

const SOCKET_URL = API_BASE_URL.replace(/\/v1\/?$/, "");

export function connectSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) return null;
  // Reuse any existing socket instance regardless of its current connected
  // state — io() connects asynchronously, and socket.io-client already
  // handles reconnection internally. Gating on `.connected` here caused a
  // race: multiple callers within the same render (each useSocketEvent, plus
  // Dashboard's own connectSocket() call) would all see `connected === false`
  // during that async window and each spin up their own independent
  // connection, leaving orphaned sockets whose listeners never fire.
  if (socket) return socket;
  socket = io(SOCKET_URL, { auth: { token }, autoConnect: true });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    const s = connectSocket();
    if (!s) return;
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
