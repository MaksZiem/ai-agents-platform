import type { ExecutionStep } from './entities/execution-step.entity.js';
import type { Execution } from './entities/execution.entity.js';
import { StepStatus, StepType } from './execution-step-enums.js';

export interface ExecutionMetrics {
  // null until the execution starts; counts up while it is running.
  durationMs: number | null;
  llmCalls: number;
  toolCalls: number;
  retries: number;
  failedSteps: number;
  approvalRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export function computeMetrics(
  execution: Pick<
    Execution,
    'startedAt' | 'finishedAt' | 'llmCalls' | 'inputTokens' | 'outputTokens'
  >,
  steps: Pick<ExecutionStep, 'type' | 'status' | 'attempt'>[],
  approvalRequests: number,
  now: Date = new Date(),
): ExecutionMetrics {
  const end = execution.finishedAt ?? now;

  return {
    durationMs: execution.startedAt
      ? end.getTime() - execution.startedAt.getTime()
      : null,
    llmCalls: execution.llmCalls,
    toolCalls: steps.filter((step) => step.type === StepType.TOOL_CALL).length,
    retries: steps.reduce((total, step) => total + step.attempt - 1, 0),
    failedSteps: steps.filter((step) => step.status === StepStatus.FAILED)
      .length,
    approvalRequests,
    inputTokens: execution.inputTokens,
    outputTokens: execution.outputTokens,
    totalTokens: execution.inputTokens + execution.outputTokens,
  };
}
