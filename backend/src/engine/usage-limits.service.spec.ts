import type { ConfigService } from '@nestjs/config';
import type { Repository } from 'typeorm';
import type { Env } from '../config/env.js';
import type { Execution } from '../executions/entities/execution.entity.js';
import { UsageLimits } from './usage-limits.service.js';

const LIMITS: Record<string, number> = {
  TOKEN_BUDGET_PER_EXECUTION: 1000,
  DAILY_TOKEN_LIMIT_PER_USER: 5000,
  MAX_CONCURRENT_EXECUTIONS_PER_USER: 2,
  MAX_EXECUTION_STARTS_PER_MINUTE: 3,
};

function createLimits({
  recentStarts = 0,
  active = 0,
  todayInput = 0,
  todayOutput = 0,
  executionTokens = { inputTokens: 0, outputTokens: 0 },
} = {}) {
  let countCall = 0;
  const repository = {
    countBy: async () => (countCall++ % 2 === 0 ? recentStarts : active),
    sum: async (column: string) =>
      column === 'inputTokens' ? todayInput : todayOutput,
    findOne: async () => ({ id: 'execution-1', ...executionTokens }),
  } as unknown as Repository<Execution>;
  const config = {
    get: (key: string) => LIMITS[key],
  } as unknown as ConfigService<Env, true>;

  return new UsageLimits(repository, config);
}

const execution = { id: 'execution-1', userId: 'user-1' } as Execution;

describe('UsageLimits', () => {
  it('lets a user start a task within every limit', async () => {
    await expect(
      createLimits().assertCanStart('user-1'),
    ).resolves.toBeUndefined();
  });

  it.each([
    [{ recentStarts: 3 }, 'per minute'],
    [{ active: 2 }, 'running or queued'],
    [{ todayInput: 4000, todayOutput: 1000 }, "today's token limit"],
  ])('rejects starting a task when %o', async (state, message) => {
    await expect(
      createLimits(state).assertCanStart('user-1'),
    ).rejects.toMatchObject({
      status: 429,
      message: expect.stringContaining(message),
    });
  });

  it('stops an execution over its token budget', async () => {
    const limits = createLimits({
      executionTokens: { inputTokens: 900, outputTokens: 100 },
    });

    await expect(limits.budgetError(execution)).resolves.toContain(
      'Token budget exceeded',
    );
  });

  it('stops an execution when the daily limit is reached', async () => {
    const limits = createLimits({ todayInput: 5000 });

    await expect(limits.budgetError(execution)).resolves.toContain(
      'Daily token limit',
    );
  });

  it('lets an execution within its budget continue', async () => {
    await expect(createLimits().budgetError(execution)).resolves.toBeNull();
  });
});
