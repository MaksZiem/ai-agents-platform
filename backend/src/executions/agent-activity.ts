import { StepStatus, StepType } from './execution-step-enums.js';
import { ExecutionStatus, isTerminal } from './execution-status.js';

export interface ActivityExecution {
  id: string;
  agentId: string;
  status: ExecutionStatus;
  task: string;
  createdAt: Date;
  startedAt: Date | null;
}

export interface ActivityStep {
  executionId: string;
  type: StepType;
  status: StepStatus;
  toolName: string | null;
  position: number;
}

export interface AgentActivity {
  agentId: string;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  lastRunAt: Date | null;
  activeRuns: number;
  current: {
    executionId: string;
    status: ExecutionStatus;
    task: string;
    startedAt: Date | null;
    step: string | null;
  } | null;
}

function stepLabel(step: ActivityStep): string {
  return (
    step.toolName ?? (step.type === StepType.PLAN ? 'Planning' : 'Answering')
  );
}

export function buildAgentActivity(
  executions: ActivityExecution[],
  steps: ActivityStep[],
): AgentActivity[] {
  const byAgent = new Map<string, AgentActivity>();

  for (const execution of executions) {
    const activity = byAgent.get(execution.agentId) ?? {
      agentId: execution.agentId,
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      lastRunAt: null,
      activeRuns: 0,
      current: null,
    };

    activity.totalRuns += 1;
    if (execution.status === ExecutionStatus.COMPLETED)
      activity.completedRuns += 1;
    if (execution.status === ExecutionStatus.FAILED) activity.failedRuns += 1;
    if (!activity.lastRunAt || execution.createdAt > activity.lastRunAt) {
      activity.lastRunAt = execution.createdAt;
    }

    if (!isTerminal(execution.status)) {
      activity.activeRuns += 1;

      if (!activity.current) {
        const step = steps
          .filter((candidate) => candidate.executionId === execution.id)
          .sort((a, b) => b.position - a.position)[0];

        activity.current = {
          executionId: execution.id,
          status: execution.status,
          task: execution.task,
          startedAt: execution.startedAt,
          step: step ? stepLabel(step) : null,
        };
      }
    }

    byAgent.set(execution.agentId, activity);
  }

  return [...byAgent.values()];
}
