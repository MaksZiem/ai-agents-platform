import { buildAgentActivity } from './agent-activity.js';
import { StepStatus, StepType } from './execution-step-enums.js';
import { ExecutionStatus } from './execution-status.js';

const execution = (
  id: string,
  agentId: string,
  status: ExecutionStatus,
  createdAt: string,
) => ({
  id,
  agentId,
  status,
  task: `Task ${id}`,
  createdAt: new Date(createdAt),
  startedAt: new Date(createdAt),
});

describe('buildAgentActivity', () => {
  it('counts runs per agent and shows the latest step of the newest active run', () => {
    const activity = buildAgentActivity(
      [
        execution('e3', 'a1', ExecutionStatus.RUNNING, '2026-11-11T12:00:00Z'),
        execution('e2', 'a1', ExecutionStatus.FAILED, '2026-11-11T11:00:00Z'),
        execution(
          'e1',
          'a1',
          ExecutionStatus.COMPLETED,
          '2026-11-11T10:00:00Z',
        ),
        execution(
          'e4',
          'a2',
          ExecutionStatus.COMPLETED,
          '2026-11-10T10:00:00Z',
        ),
      ],
      [
        {
          executionId: 'e3',
          type: StepType.PLAN,
          status: StepStatus.COMPLETED,
          toolName: null,
          position: 1,
        },
        {
          executionId: 'e3',
          type: StepType.TOOL_CALL,
          status: StepStatus.RUNNING,
          toolName: 'readDocument',
          position: 2,
        },
      ],
    );

    expect(activity.find((item) => item.agentId === 'a1')).toMatchObject({
      totalRuns: 3,
      completedRuns: 1,
      failedRuns: 1,
      activeRuns: 1,
      lastRunAt: new Date('2026-11-11T12:00:00Z'),
      current: { executionId: 'e3', step: 'readDocument' },
    });
    expect(activity.find((item) => item.agentId === 'a2')).toMatchObject({
      totalRuns: 1,
      activeRuns: 0,
      current: null,
    });
  });
});
