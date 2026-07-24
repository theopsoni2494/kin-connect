import { cn } from "@/lib/utils";

export function NotificationDot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className={cn("ml-auto h-2 w-2 shrink-0 rounded-full bg-destructive")}
      aria-label="unread"
    />
  );
}
