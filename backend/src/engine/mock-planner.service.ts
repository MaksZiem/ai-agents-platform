import { Injectable } from '@nestjs/common';
import {
  Planner,
  type PlannedToolCall,
  type PlanningContext,
} from './planner.js';

// Deterministic stand-in for the LLM planner, useful without a Gemini key.
@Injectable()
export class MockPlanner extends Planner {
  plan({ task }: PlanningContext): Promise<PlannedToolCall[]> {
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

    return Promise.resolve(toolCalls);
  }
}
