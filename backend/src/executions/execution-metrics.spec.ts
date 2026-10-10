import { computeMetrics } from './execution-metrics.js';
import { StepStatus, StepType } from './execution-step-enums.js';

const execution = {
  startedAt: new Date('2026-01-01T10:00:00.000Z'),
  finishedAt: new Date('2026-01-01T10:00:18.400Z'),
  llmCalls: 4,
  inputTokens: 6000,
  outputTokens: 2421,
};

describe('computeMetrics', () => {
  it('summarizes steps, tokens and duration', () => {
    const steps = [
      { type: StepType.PLAN, status: StepStatus.COMPLETED, attempt: 1 },
      { type: StepType.TOOL_CALL, status: StepStatus.COMPLETED, attempt: 2 },
      { type: StepType.TOOL_CALL, status: StepStatus.FAILED, attempt: 3 },
      { type: StepType.FINAL_ANSWER, status: StepStatus.COMPLETED, attempt: 1 },
    ];

    expect(computeMetrics(execution, steps, 1)).toEqual({
      durationMs: 18_400,
      llmCalls: 4,
      toolCalls: 2,
      retries: 3,
      failedSteps: 1,
      approvalRequests: 1,
      inputTokens: 6000,
      outputTokens: 2421,
      totalTokens: 8421,
    });
  });

  it('measures a running execution up to now', () => {
    const metrics = computeMetrics(
      { ...execution, finishedAt: null },
      [],
      0,
      new Date('2026-01-01T10:00:05.000Z'),
    );

    expect(metrics.durationMs).toBe(5_000);
  });

  it('has no duration before the execution starts', () => {
    const metrics = computeMetrics(
      { ...execution, startedAt: null, finishedAt: null },
      [],
      0,
    );

    expect(metrics.durationMs).toBeNull();
  });
});
