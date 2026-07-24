import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketEvent } from "./socket-client";
import { playNotificationSound } from "./notification-sound";

export type NotificationTab =
  | "recent"
  | "past"
  | "alerts"
  | "notifications"
  | "open"
  | "pending"
  | "closed"
  | "broadcast";

interface NotificationDotsContextValue {
  isUnread: (tab: NotificationTab) => boolean;
  clear: (tab: NotificationTab) => void;
}

const NotificationDotsContext = createContext<NotificationDotsContextValue | null>(null);

export function NotificationDotsProvider({ children }: { children: ReactNode }) {
  const [unread, setUnread] = useState<Partial<Record<NotificationTab, boolean>>>({});
  const qc = useQueryClient();

  const mark = useCallback((tab: NotificationTab) => {
    setUnread((prev) => ({ ...prev, [tab]: true }));
  }, []);

  const clear = useCallback((tab: NotificationTab) => {
    setUnread((prev) => ({ ...prev, [tab]: false }));
  }, []);

  useSocketEvent("ticket:created", (payload: { employeeCode: string; adminMessage?: string }) => {
    mark("open");
    mark("notifications");
    qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
    toast(payload.adminMessage ?? `You have a new query from Employee ID: ${payload.employeeCode}. Kindly address it.`);
    playNotificationSound();
  });

  useSocketEvent("ticket:replied", (payload: { from: "user" | "admin"; message?: string }) => {
    if (payload.from === "admin") {
      mark("recent");
      mark("notifications");
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast(payload.message ?? "Your query received a reply.");
      playNotificationSound();
    } else {
      mark("pending");
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast("A query was updated by an employee.");
    }
  });

  useSocketEvent("ticket:closed", () => {
    mark("closed");
    qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    toast("A query has been resolved.");
  });

  useSocketEvent("broadcast:sent", () => {
    mark("alerts");
    qc.invalidateQueries({ queryKey: ["my-broadcasts"] });
    qc.invalidateQueries({ queryKey: ["sent-broadcasts"] });
    toast("New alert from admin.");
  });

  const value = useMemo(() => ({ isUnread: (tab: NotificationTab) => Boolean(unread[tab]), clear }), [unread, clear]);

  return <NotificationDotsContext.Provider value={value}>{children}</NotificationDotsContext.Provider>;
}

export function useNotificationDots(): NotificationDotsContextValue {
  const ctx = useContext(NotificationDotsContext);
  if (!ctx) {
    // Outside the provider (e.g. auth page) — no-op fallback.
    return { isUnread: () => false, clear: () => undefined };
  }
  return ctx;
}
