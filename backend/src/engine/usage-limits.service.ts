import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { startOfDay } from '../common/dates.js';
import type { Env } from '../config/env.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';

export interface UsageQuota {
  tokensToday: number;
  dailyTokenLimit: number;
  tokenBudgetPerExecution: number;
  maxConcurrentExecutions: number;
}

const RATE_WINDOW_MS = 60_000;

@Injectable()
export class UsageLimits {
  readonly tokenBudgetPerExecution: number;
  readonly dailyTokenLimit: number;
  readonly maxConcurrentExecutions: number;
  readonly maxStartsPerMinute: number;

  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    config: ConfigService<Env, true>,
  ) {
    this.tokenBudgetPerExecution = config.get('TOKEN_BUDGET_PER_EXECUTION', {
      infer: true,
    });
    this.dailyTokenLimit = config.get('DAILY_TOKEN_LIMIT_PER_USER', {
      infer: true,
    });
    this.maxConcurrentExecutions = config.get(
      'MAX_CONCURRENT_EXECUTIONS_PER_USER',
      { infer: true },
    );
    this.maxStartsPerMinute = config.get('MAX_EXECUTION_STARTS_PER_MINUTE', {
      infer: true,
    });
  }

  async tokensToday(userId: string): Promise<number> {
    const where = {
      userId,
      createdAt: MoreThanOrEqual(startOfDay(new Date())),
    };
    const [input, output] = await Promise.all([
      this.executionsRepository.sum('inputTokens', where),
      this.executionsRepository.sum('outputTokens', where),
    ]);
    return (input ?? 0) + (output ?? 0);
  }

  async quota(userId: string): Promise<UsageQuota> {
    return {
      tokensToday: await this.tokensToday(userId),
      dailyTokenLimit: this.dailyTokenLimit,
      tokenBudgetPerExecution: this.tokenBudgetPerExecution,
      maxConcurrentExecutions: this.maxConcurrentExecutions,
    };
  }

  async assertCanStart(userId: string): Promise<void> {
    const [recentStarts, active, tokensToday] = await Promise.all([
      this.executionsRepository.countBy({
        userId,
        createdAt: MoreThanOrEqual(new Date(Date.now() - RATE_WINDOW_MS)),
      }),
      this.executionsRepository.countBy({
        userId,
        status: In([ExecutionStatus.QUEUED, ExecutionStatus.RUNNING]),
      }),
      this.tokensToday(userId),
    ]);

    if (recentStarts >= this.maxStartsPerMinute) {
      throw this.tooMany(
        `You can start at most ${this.maxStartsPerMinute} tasks per minute. Wait a moment and try again.`,
      );
    }

    if (active >= this.maxConcurrentExecutions) {
      throw this.tooMany(
        `You already have ${active} tasks running or queued (limit ${this.maxConcurrentExecutions}). Wait for one to finish or cancel it.`,
      );
    }

    if (tokensToday >= this.dailyTokenLimit) {
      throw this.tooMany(
        `You have used today's token limit (${this.dailyTokenLimit.toLocaleString('en-US')} tokens). It resets at midnight.`,
      );
    }
  }

  async budgetError(execution: Execution): Promise<string | null> {
    const current = await this.executionsRepository.findOne({
      where: { id: execution.id },
      select: { id: true, inputTokens: true, outputTokens: true },
    });
    const used = (current?.inputTokens ?? 0) + (current?.outputTokens ?? 0);

    if (used >= this.tokenBudgetPerExecution) {
      return `Token budget exceeded: this execution used ${used.toLocaleString('en-US')} of ${this.tokenBudgetPerExecution.toLocaleString('en-US')} tokens.`;
    }

    if ((await this.tokensToday(execution.userId)) >= this.dailyTokenLimit) {
      return `Daily token limit reached (${this.dailyTokenLimit.toLocaleString('en-US')} tokens). It resets at midnight.`;
    }

    return null;
  }

  private tooMany(message: string) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
