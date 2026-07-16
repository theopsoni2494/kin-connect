import twilio from "twilio";
import { config, isTwilioConfigured } from "../../config/env.js";
import type { WhatsAppProvider } from "./provider.js";

class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly isConfigured = isTwilioConfigured;
  private client = this.isConfigured
    ? twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
    : null;

  async send(toE164: string, body: string): Promise<{ providerMessageId: string }> {
    if (!this.client) {
      // No credentials yet — log and no-op so the dispatcher's email fallback
      // kicks in cleanly. The moment TWILIO_* env vars are supplied this
      // branch stops being taken, with zero code changes required.
      console.info(`[whatsapp:not-configured] would send to ${toE164}: ${body}`);
      throw new Error("Twilio WhatsApp is not configured");
    }
    const message = await this.client.messages.create({
      from: `whatsapp:${config.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${toE164}`,
      body,
    });
    return { providerMessageId: message.sid };
  }
}

export const whatsAppProvider: WhatsAppProvider = new TwilioWhatsAppProvider();
