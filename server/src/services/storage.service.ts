import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { config, isSupabaseStorageConfigured } from "../config/env.js";

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!isSupabaseStorageConfigured) {
    throw new Error(
      "Supabase Storage is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  if (!client) {
    client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
  }
  return client;
}

export async function uploadAttachmentBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string,
): Promise<{ path: string }> {
  const ext = originalName.split(".").pop() ?? "bin";
  const path = `${folder}/${uuidv4()}.${ext}`;
  const { error } = await getClient()
    .storage.from(config.SUPABASE_STORAGE_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return { path };
}

export async function getSignedAttachmentUrl(path: string, expiresInSeconds = 600): Promise<string> {
  const { data, error } = await getClient()
    .storage.from(config.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw error ?? new Error("failed to sign url");
  return data.signedUrl;
}
