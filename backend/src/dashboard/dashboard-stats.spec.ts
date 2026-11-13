import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import {
  buildDailyActivity,
  rankTools,
  summarizeUsage,
} from './dashboard-stats.js';
import { startOfDay } from '../common/dates.js';

const NOW = new Date(2026, 10, 13, 15, 30);

function daysAgo(days: number, hour = 12) {
  const date = startOfDay(NOW, days);
  date.setHours(hour);
  return date;
}

describe('buildDailyActivity', () => {
  it('returns one bucket per day, oldest first, ending today', () => {
    const activity = buildDailyActivity([], 3, NOW);

    expect(activity.map((day) => day.date)).toEqual([
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
    ]);
  });

  it('counts executions by status and ignores older ones', () => {
    const activity = buildDailyActivity(
      [
        { status: ExecutionStatus.COMPLETED, createdAt: daysAgo(0) },
        { status: ExecutionStatus.COMPLETED, createdAt: daysAgo(0, 0) },
        { status: ExecutionStatus.FAILED, createdAt: daysAgo(0) },
        { status: ExecutionStatus.RUNNING, createdAt: daysAgo(0) },
        { status: ExecutionStatus.CANCELLED, createdAt: daysAgo(1) },
        { status: ExecutionStatus.COMPLETED, createdAt: daysAgo(5) },
      ],
      2,
      NOW,
    );

    expect(activity).toEqual([
      { date: '2026-11-12', completed: 0, failed: 0, cancelled: 1, active: 0 },
      { date: '2026-11-13', completed: 2, failed: 1, cancelled: 0, active: 1 },
    ]);
  });
});

describe('summarizeUsage', () => {
  it('sums tokens and calls, averages finished durations and counts retries', () => {
    const usage = summarizeUsage(
      [
        {
          status: ExecutionStatus.COMPLETED,
          inputTokens: 1000,
          outputTokens: 200,
          llmCalls: 3,
          startedAt: new Date(0),
          finishedAt: new Date(10_000),
        },
        {
          status: ExecutionStatus.FAILED,
          inputTokens: 500,
          outputTokens: 0,
          llmCalls: 1,
          startedAt: new Date(0),
          finishedAt: new Date(4_000),
        },
        {
          status: ExecutionStatus.RUNNING,
          inputTokens: 0,
          outputTokens: 0,
          llmCalls: 0,
          startedAt: new Date(0),
          finishedAt: null,
        },
      ],
      [{ attempt: 1 }, { attempt: 3 }, { attempt: 2 }],
    );

    expect(usage).toEqual({
      executions: 3,
      completed: 1,
      failed: 1,
      tokens: 1700,
      llmCalls: 4,
      avgDurationMs: 7000,
      retries: 3,
    });
  });

  it('has no average duration without finished executions', () => {
    expect(summarizeUsage([], []).avgDurationMs).toBeNull();
  });
});

describe('rankTools', () => {
  it('ranks tool calls by count and counts failures', () => {
    const step = (toolName: string | null, status = StepStatus.COMPLETED) => ({
      type: toolName ? StepType.TOOL_CALL : StepType.PLAN,
      status,
      toolName,
      attempt: 1,
    });

    expect(
      rankTools(
        [
          step('readDocument'),
          step('calculate'),
          step('readDocument', StepStatus.FAILED),
          step('readDocument'),
          step('calculate'),
          step('askUser', StepStatus.SKIPPED),
          step(null),
        ],
        2,
      ),
    ).toEqual([
      { toolName: 'readDocument', calls: 3, failed: 1 },
      { toolName: 'calculate', calls: 2, failed: 0 },
    ]);
  });
});
