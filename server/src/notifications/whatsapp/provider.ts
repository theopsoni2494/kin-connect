export interface WhatsAppProvider {
  readonly isConfigured: boolean;
  send(toE164: string, body: string): Promise<{ providerMessageId: string }>;
}
