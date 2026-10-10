import { Injectable } from '@nestjs/common';
import {
  type ModelToolCall,
  type ModelTurn,
  Planner,
  type TurnContext,
} from './planner.js';

// Deterministic stand-in for the LLM planner, useful without a Gemini key.
// Asks for all its tools on the first turn and answers on the second.
@Injectable()
export class MockPlanner extends Planner {
  next({ task, history }: TurnContext): Promise<ModelTurn> {
    if (history.some((entry) => entry.kind === 'model')) {
      const toolResults = history.filter((entry) => entry.kind === 'tool');

      return Promise.resolve({
        text: `Completed ${toolResults.length} tool calls.`,
        toolCalls: [],
        raw: null,
        usage: null,
      });
    }

    const toolCalls: ModelToolCall[] = [
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

    return Promise.resolve({ text: null, toolCalls, raw: null, usage: null });
  }
}
