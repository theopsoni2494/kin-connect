import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { notifications, employees, admins, profiles } from "../db/schema.js";
import type { NotificationJob } from "./types.js";
import { whatsAppProvider } from "./whatsapp/twilio-provider.js";
import { emailProvider } from "./email/mailer.js";
import { subjectFor } from "./templates.js";

async function resolveContact(job: NotificationJob): Promise<{ whatsapp?: string; email?: string }> {
  if (job.recipient.type === "employee") {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.code, job.recipient.code))
      .limit(1);
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.identifier, job.recipient.code))
      .limit(1);
    return { whatsapp: employee?.whatsappNumber ?? undefined, email: profile?.officeMail ?? undefined };
  }
  const [admin] = await db.select().from(admins).where(eq(admins.id, job.recipient.id)).limit(1);
  return { whatsapp: admin?.whatsappNumber ?? undefined, email: admin?.email ?? undefined };
}

/**
 * Fire-and-forget: writes an outbox row per channel and attempts delivery.
 * inapp is always considered "sent" (Socket.io push already happened by the
 * time this runs). whatsapp is attempted first; email is only attempted as a
 * fallback when whatsapp is unconfigured or the send failed.
 */
export async function dispatchNotification(job: NotificationJob): Promise<void> {
  const recipientColumns =
    job.recipient.type === "employee"
      ? { recipientType: "employee" as const, recipientEmployeeCode: job.recipient.code }
      : { recipientType: "admin" as const, recipientAdminId: job.recipient.id };

  await db.insert(notifications).values({
    eventType: job.eventType,
    ticketId: job.ticketId,
    broadcastId: job.broadcastId,
    ...recipientColumns,
    message: job.message,
    channel: "inapp",
    status: "sent",
    sentAt: new Date(),
  });

  const contact = await resolveContact(job);
  let whatsappDelivered = false;

  if (contact.whatsapp && whatsAppProvider.isConfigured) {
    try {
      const { providerMessageId } = await whatsAppProvider.send(contact.whatsapp, job.message);
      await db.insert(notifications).values({
        eventType: job.eventType,
        ticketId: job.ticketId,
        broadcastId: job.broadcastId,
        ...recipientColumns,
        channel: "whatsapp",
        status: "sent",
        provider: "twilio",
        providerMessageId,
        sentAt: new Date(),
      });
      whatsappDelivered = true;
    } catch (err) {
      await db.insert(notifications).values({
        eventType: job.eventType,
        ticketId: job.ticketId,
        broadcastId: job.broadcastId,
        ...recipientColumns,
        channel: "whatsapp",
        status: "failed",
        provider: "twilio",
        errorMessage: (err as Error).message,
      });
    }
  } else {
    await db.insert(notifications).values({
      eventType: job.eventType,
      ticketId: job.ticketId,
      broadcastId: job.broadcastId,
      ...recipientColumns,
      channel: "whatsapp",
      status: "skipped_no_config",
    });
  }

  if (!whatsappDelivered && contact.email && emailProvider.isConfigured) {
    try {
      const { providerMessageId } = await emailProvider.send(
        contact.email,
        subjectFor(job.eventType),
        job.message,
      );
      await db.insert(notifications).values({
        eventType: job.eventType,
        ticketId: job.ticketId,
        broadcastId: job.broadcastId,
        ...recipientColumns,
        channel: "email",
        status: "sent",
        provider: "smtp",
        providerMessageId,
        sentAt: new Date(),
      });
    } catch (err) {
      await db.insert(notifications).values({
        eventType: job.eventType,
        ticketId: job.ticketId,
        broadcastId: job.broadcastId,
        ...recipientColumns,
        channel: "email",
        status: "failed",
        provider: "smtp",
        errorMessage: (err as Error).message,
      });
    }
  } else if (!whatsappDelivered) {
    await db.insert(notifications).values({
      eventType: job.eventType,
      ticketId: job.ticketId,
      broadcastId: job.broadcastId,
      ...recipientColumns,
      channel: "email",
      status: "skipped_no_config",
    });
  }
}
