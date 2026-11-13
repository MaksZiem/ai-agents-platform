import { startOfDay } from '../common/dates.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import { ExecutionStatus } from '../executions/execution-status.js';

export interface DayActivity {
  date: string;
  completed: number;
  failed: number;
  cancelled: number;
  active: number;
}

export interface UsageSummary {
  executions: number;
  completed: number;
  failed: number;
  tokens: number;
  llmCalls: number;
  avgDurationMs: number | null;
  retries: number;
}

export interface ToolUsage {
  toolName: string;
  calls: number;
  failed: number;
}

interface ActivityExecution {
  status: ExecutionStatus;
  createdAt: Date;
}

interface UsageExecution {
  status: ExecutionStatus;
  inputTokens: number;
  outputTokens: number;
  llmCalls: number;
  startedAt: Date | null;
  finishedAt: Date | null;
}

interface UsageStep {
  type: StepType;
  status: StepStatus;
  toolName: string | null;
  attempt: number;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildDailyActivity(
  executions: ActivityExecution[],
  days: number,
  now = new Date(),
): DayActivity[] {
  const result = Array.from({ length: days }, (_, index) => ({
    date: dayKey(startOfDay(now, days - 1 - index)),
    completed: 0,
    failed: 0,
    cancelled: 0,
    active: 0,
  }));
  const byDate = new Map(result.map((day) => [day.date, day]));

  for (const execution of executions) {
    const day = byDate.get(dayKey(execution.createdAt));
    if (!day) continue;

    switch (execution.status) {
      case ExecutionStatus.COMPLETED:
        day.completed++;
        break;
      case ExecutionStatus.FAILED:
        day.failed++;
        break;
      case ExecutionStatus.CANCELLED:
        day.cancelled++;
        break;
      default:
        day.active++;
    }
  }

  return result;
}

export function summarizeUsage(
  executions: UsageExecution[],
  steps: Pick<UsageStep, 'attempt'>[],
): UsageSummary {
  const durations = executions.flatMap(({ startedAt, finishedAt }) =>
    startedAt && finishedAt ? [finishedAt.getTime() - startedAt.getTime()] : [],
  );

  return {
    executions: executions.length,
    completed: executions.filter(
      (execution) => execution.status === ExecutionStatus.COMPLETED,
    ).length,
    failed: executions.filter(
      (execution) => execution.status === ExecutionStatus.FAILED,
    ).length,
    tokens: executions.reduce(
      (sum, execution) => sum + execution.inputTokens + execution.outputTokens,
      0,
    ),
    llmCalls: executions.reduce(
      (sum, execution) => sum + execution.llmCalls,
      0,
    ),
    avgDurationMs:
      durations.length === 0
        ? null
        : Math.round(
            durations.reduce((sum, duration) => sum + duration, 0) /
              durations.length,
          ),
    retries: steps.reduce(
      (sum, step) => sum + Math.max(0, step.attempt - 1),
      0,
    ),
  };
}

export function rankTools(steps: UsageStep[], limit: number): ToolUsage[] {
  const usage = new Map<string, ToolUsage>();

  for (const step of steps) {
    if (step.type !== StepType.TOOL_CALL || !step.toolName) continue;

    const entry = usage.get(step.toolName) ?? {
      toolName: step.toolName,
      calls: 0,
      failed: 0,
    };
    entry.calls++;
    if (step.status === StepStatus.FAILED) entry.failed++;
    usage.set(step.toolName, entry);
  }

  return [...usage.values()]
    .sort((a, b) => b.calls - a.calls || a.toolName.localeCompare(b.toolName))
    .slice(0, limit);
}
