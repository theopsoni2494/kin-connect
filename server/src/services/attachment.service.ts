import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { attachments } from "../db/schema.js";
import { uploadAttachmentBuffer, getSignedAttachmentUrl } from "./storage.service.js";
import { config } from "../config/env.js";

export type AttachmentRow = typeof attachments.$inferSelect;

export async function createTextAttachment(text: string) {
  const [row] = await db
    .insert(attachments)
    .values({ kind: "text", textContent: text })
    .returning();
  return row;
}

export async function createFileAttachment(
  kind: "voice" | "video" | "photo" | "file",
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  text?: string,
) {
  const { path } = await uploadAttachmentBuffer(buffer, originalName, mimeType, "tickets");
  const [row] = await db
    .insert(attachments)
    .values({
      kind,
      storageBucket: config.SUPABASE_STORAGE_BUCKET,
      storagePath: path,
      originalName,
      mimeType,
      sizeBytes: buffer.byteLength,
      textContent: text || null,
    })
    .returning();
  return row;
}

export async function getAttachment(id: string): Promise<AttachmentRow | undefined> {
  const [row] = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
  return row;
}

export interface AttachmentDto {
  id: string;
  kind: string;
  name?: string | null;
  mimeType?: string | null;
  text?: string | null;
  url?: string | null;
}

export async function toAttachmentDto(a: AttachmentRow): Promise<AttachmentDto> {
  if (a.kind === "text") {
    return { id: a.id, kind: a.kind, text: a.textContent };
  }
  const url = a.storagePath ? await getSignedAttachmentUrl(a.storagePath).catch(() => null) : null;
  return { id: a.id, kind: a.kind, name: a.originalName, mimeType: a.mimeType, url, text: a.textContent };
}
