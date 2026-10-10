import type { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import type { ExecutionStatus } from '../executions/execution-status.js';

export const EXECUTION_UPDATED = 'execution.updated';
export const STEP_UPDATED = 'execution.step.updated';

export interface ExecutionUpdatedEvent {
  executionId: string;
  status: ExecutionStatus;
  result?: string | null;
  error?: string | null;
}

export interface StepUpdatedEvent {
  executionId: string;
  step: ExecutionStep;
}
