import { config } from "../config/env.js";
import type { NotificationEventType } from "./types.js";

export function renderMessage(
  eventType: NotificationEventType,
  params: { ticketId?: string; departmentName?: string; broadcastMessage?: string },
): string {
  const brand = config.BRAND_NAME;
  switch (eventType) {
    case "ticket_created":
      return `[${brand}] Your query ${params.ticketId} (${params.departmentName}) has been registered.`;
    case "ticket_replied":
      return `[${brand}] Your query ${params.ticketId} has a new reply. Please check your dashboard.`;
    case "ticket_closed":
      return `[${brand}] Your query ${params.ticketId} has been resolved and closed.`;
    case "broadcast_sent":
      return `[${brand}] Alert: ${params.broadcastMessage}`;
    default:
      return `[${brand}] You have an update.`;
  }
}

export function subjectFor(eventType: NotificationEventType): string {
  switch (eventType) {
    case "ticket_created":
      return "Query registered";
    case "ticket_replied":
      return "Query updated";
    case "ticket_closed":
      return "Query resolved";
    case "broadcast_sent":
      return "New alert";
    default:
      return "Update";
  }
}
