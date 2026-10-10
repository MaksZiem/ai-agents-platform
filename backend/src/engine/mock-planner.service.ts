import { Injectable } from '@nestjs/common';
import {
  type AnswerContext,
  type AnswerResult,
  Planner,
  type PlannedToolCall,
  type PlanningContext,
  type PlanResult,
} from './planner.js';

// Deterministic stand-in for the LLM planner, useful without a Gemini key.
@Injectable()
export class MockPlanner extends Planner {
  plan({ task }: PlanningContext): Promise<PlanResult> {
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

    return Promise.resolve({ toolCalls, usage: null });
  }

  answer({ results }: AnswerContext): Promise<AnswerResult> {
    return Promise.resolve({
      answer: `Completed ${results.length} tool calls.`,
      usage: null,
    });
  }
}
