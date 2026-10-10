import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';

const RECENT_EXECUTIONS_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
  ) {}

  async getSummary(userId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [agents, tasksToday, running, waitingForApproval, recentExecutions] =
      await Promise.all([
        this.agentsRepository.countBy({ userId }),
        this.executionsRepository.countBy({
          userId,
          createdAt: MoreThanOrEqual(startOfToday),
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
      ]);

    return {
      agents,
      tasksToday,
      running,
      waitingForApproval,
      recentExecutions,
    };
  }
}
