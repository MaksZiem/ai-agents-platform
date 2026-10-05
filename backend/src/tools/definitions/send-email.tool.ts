import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const sendEmailTool = defineTool({
  name: 'sendEmail',
  description: 'Sends an email to a single recipient.',
  inputSchema: z.object({
    to: z.email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(10_000),
  }),
  outputSchema: z.object({
    messageId: z.string(),
    sentAt: z.iso.datetime(),
  }),
  permission: { resource: 'email', action: 'send' },
  requiresApproval: true,
  execute: async () => {
    // Mock: nothing is actually sent yet.
    return { messageId: randomUUID(), sentAt: new Date().toISOString() };
  },
});
