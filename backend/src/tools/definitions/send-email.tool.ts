import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const sendEmailTool = defineTool({
  name: 'sendEmail',
  summary: 'Sends an email, optionally with a generated report attached.',
  category: 'communication',
  description:
    'Sends a plain-text email to a single recipient. To attach a report created in this execution, pass the fileId returned by generateReport as attachmentFileId.',
  inputSchema: z.object({
    to: z.email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(10_000),
    attachmentFileId: z.uuid().optional(),
  }),
  outputSchema: z.object({
    messageId: z.string(),
    attachment: z.string().nullable(),
    sentAt: z.iso.datetime(),
  }),
  permission: { resource: 'email', action: 'send' },
  requiresApproval: true,
  execute: async (email, context) => {
    const { messageId, attachment } = await context.sendEmail(email);
    return { messageId, attachment, sentAt: new Date().toISOString() };
  },
});
