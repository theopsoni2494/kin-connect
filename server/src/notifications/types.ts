export type NotificationEventType =
  | "ticket_created"
  | "ticket_replied"
  | "ticket_closed"
  | "broadcast_sent";

export type NotificationRecipient =
  | { type: "employee"; code: string }
  | { type: "admin"; id: string };

export interface NotificationJob {
  eventType: NotificationEventType;
  ticketId?: string;
  broadcastId?: string;
  recipient: NotificationRecipient;
  message: string; // pre-rendered text body for whatsapp/email
}
