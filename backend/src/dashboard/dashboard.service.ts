import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { ApprovalStatus } from '../approvals/approval-status.js';
import { Approval } from '../approvals/entities/approval.entity.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import {
  buildDailyActivity,
  rankTools,
  startOfDay,
  summarizeUsage,
} from './dashboard-stats.js';

const RECENT_EXECUTIONS_LIMIT = 5;
const ACTIVITY_DAYS = 14;
const USAGE_DAYS = 7;
const TOP_TOOLS_LIMIT = 5;
const ATTENTION_LIMIT = 5;
const RECENT_FAILURE_HOURS = 24;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    @InjectRepository(ExecutionStep)
    private readonly stepsRepository: Repository<ExecutionStep>,
    @InjectRepository(Approval)
    private readonly approvalsRepository: Repository<Approval>,
  ) {}

  async getSummary(userId: string) {
    const now = new Date();
    const activitySince = startOfDay(now, ACTIVITY_DAYS - 1);
    const usageSince = startOfDay(now, USAGE_DAYS - 1);
    const failuresSince = new Date(
      now.getTime() - RECENT_FAILURE_HOURS * 60 * 60 * 1000,
    );

    const [
      agents,
      tasksToday,
      running,
      waitingForApproval,
      recentExecutions,
      periodExecutions,
      usageSteps,
      pendingApprovals,
      recentFailures,
    ] = await Promise.all([
      this.agentsRepository.countBy({ userId }),
      this.executionsRepository.countBy({
        userId,
        createdAt: MoreThanOrEqual(startOfDay(now)),
      }),
      this.executionsRepository.countBy({
        userId,
        status: ExecutionStatus.RUNNING,
      }),
      this.executionsRepository.countBy({
        userId,
        status: ExecutionStatus.WAITING_FOR_APPROVAL,
      }),
      this.executionsRepository.find({
        where: { userId },
        relations: { agent: true },
        order: { createdAt: 'DESC' },
        take: RECENT_EXECUTIONS_LIMIT,
      }),
      this.executionsRepository.find({
        where: { userId, createdAt: MoreThanOrEqual(activitySince) },
        select: {
          id: true,
          status: true,
          createdAt: true,
          startedAt: true,
          finishedAt: true,
          inputTokens: true,
          outputTokens: true,
          llmCalls: true,
        },
      }),
      this.stepsRepository
        .createQueryBuilder('step')
        .innerJoin('step.execution', 'execution')
        .where('execution.userId = :userId', { userId })
        .andWhere('execution.createdAt >= :since', { since: usageSince })
        .select(['step.type', 'step.status', 'step.toolName', 'step.attempt'])
        .getMany(),
      this.approvalsRepository.find({
        where: { userId, status: ApprovalStatus.PENDING },
        relations: { execution: { agent: true } },
        order: { createdAt: 'ASC' },
        take: ATTENTION_LIMIT,
      }),
      this.executionsRepository.find({
        where: {
          userId,
          status: ExecutionStatus.FAILED,
          finishedAt: MoreThanOrEqual(failuresSince),
        },
        relations: { agent: true },
        order: { finishedAt: 'DESC' },
        take: ATTENTION_LIMIT,
      }),
    ]);

    const usageExecutions = periodExecutions.filter(
      (execution) => execution.createdAt >= usageSince,
    );

    return {
      agents,
      tasksToday,
      running,
      waitingForApproval,
      recentExecutions,
      activity: buildDailyActivity(periodExecutions, ACTIVITY_DAYS, now),
      usage: summarizeUsage(usageExecutions, usageSteps),
      topTools: rankTools(usageSteps, TOP_TOOLS_LIMIT),
      attention: {
        approvals: pendingApprovals,
        failures: recentFailures,
      },
    };
  }
}
