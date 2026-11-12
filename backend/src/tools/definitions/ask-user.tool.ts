import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const ASK_USER_TOOL = 'askUser';

export const askUserTool = defineTool({
  name: ASK_USER_TOOL,
  description:
    'Asks the user a question and pauses the execution until they answer. Use it only when the task is ambiguous or you need information you cannot get from documents or other tools, e.g. which period to analyze or who should receive a report. Ask one short, specific question; add up to 6 suggested answers in options when the choice is closed. The user may also skip the question: then continue with your best judgement and state the assumption in your answer. Call it alone, not together with other tools.',
  inputSchema: z.object({
    question: z.string().trim().min(1).max(1000),
    options: z.array(z.string().trim().min(1).max(200)).max(6).optional(),
  }),
  outputSchema: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  permission: null,
  requiresApproval: true,
  execute: async ({ question }, context) => {
    if (!context.userAnswer) {
      throw new BadRequestException('The user has not answered the question');
    }

    return { question, answer: context.userAnswer };
  },
});
