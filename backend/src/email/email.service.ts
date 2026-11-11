import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Env } from '../config/env.js';

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  attachments?: EmailAttachment[];
  idempotencyKey?: string;
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    this.resend = new Resend(config.get('RESEND_API_KEY', { infer: true }));
    this.from = config.get('EMAIL_FROM', { infer: true });
  }

  async send({
    to,
    subject,
    text,
    attachments = [],
    idempotencyKey,
  }: OutgoingEmail): Promise<{ id: string }> {
    const { data, error } = await this.resend.emails.send(
      {
        from: this.from,
        to,
        subject,
        text,
        attachments: attachments.map((attachment) => ({
          filename: attachment.filename,
          content: Buffer.from(attachment.content, 'utf8'),
          contentType: attachment.contentType,
        })),
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    if (error || !data) {
      throw new Error(
        `Email provider error: ${error?.message ?? 'no response'}`,
      );
    }

    return { id: data.id };
  }
}
