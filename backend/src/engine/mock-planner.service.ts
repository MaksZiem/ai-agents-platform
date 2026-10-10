import { Injectable } from '@nestjs/common';

export interface PlannedToolCall {
  toolName: string;
  input: Record<string, unknown>;
}

// Deterministic stand-in for the LLM planner. Gemini replaces it later.
@Injectable()
export class MockPlanner {
  plan(task: string): PlannedToolCall[] {
    const toolCalls: PlannedToolCall[] = [
      {
        toolName: 'getTransactions',
        input: { from: '2025-10-01', to: '2025-12-31' },
      },
      {
        toolName: 'getTransactions',
        input: { from: '2026-01-01', to: '2026-03-31' },
      },
    ];

    if (/email/i.test(task)) {
      toolCalls.push({
        toolName: 'sendEmail',
        input: {
          to: 'accountant@company.com',
          subject: 'Q1 Financial Report',
          body: 'Please find the Q1 financial report attached.',
        },
      });
    }

    return toolCalls;
  }
}
