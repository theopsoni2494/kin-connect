import nodemailer, { type Transporter } from "nodemailer";
import { config, isSmtpConfigured } from "../../config/env.js";

export interface EmailProvider {
  readonly isConfigured: boolean;
  send(to: string, subject: string, body: string): Promise<{ providerMessageId: string }>;
}

class SmtpEmailProvider implements EmailProvider {
  readonly isConfigured = isSmtpConfigured;
  private transporter: Transporter | null = this.isConfigured
    ? nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
      })
    : null;

  async send(to: string, subject: string, body: string): Promise<{ providerMessageId: string }> {
    if (!this.transporter) {
      console.info(`[email:not-configured] would send to ${to}: ${subject} — ${body}`);
      throw new Error("SMTP is not configured");
    }
    const info = await this.transporter.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      text: body,
    });
    return { providerMessageId: info.messageId };
  }
}

export const emailProvider: EmailProvider = new SmtpEmailProvider();
