import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentsService } from '../agents/agents.service.js';
import { AgentStatus } from '../agents/entities/agent.entity.js';
import { ExecutionRunner } from '../engine/execution-runner.service.js';
import { ExecutionStateManager } from '../engine/execution-state-manager.service.js';
import { Execution } from './entities/execution.entity.js';
import { ExecutionStatus, isTerminal } from './execution-status.js';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    private readonly agentsService: AgentsService,
    private readonly state: ExecutionStateManager,
    private readonly runner: ExecutionRunner,
  ) {}

  async create(agentId: string, task: string, userId: string) {
    const agent = await this.agentsService.findOne(agentId, userId);

    if (agent.status !== AgentStatus.ACTIVE) {
      throw new ConflictException('Agent is inactive');
    }

    const execution = await this.executionsRepository.save(
      this.executionsRepository.create({ agentId, userId, task }),
    );

    this.runner
      .run(execution.id)
      .catch((error: unknown) =>
        this.logger.error(`Failed to run execution ${execution.id}`, error),
      );

    return execution;
  }

  findAll(userId: string, agentId?: string): Promise<Execution[]> {
    return this.executionsRepository.find({
      where: agentId ? { userId, agentId } : { userId },
      relations: { agent: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForAgent(agentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);
    return this.findAll(userId, agentId);
  }

  async findOne(id: string, userId: string): Promise<Execution> {
    const execution = await this.executionsRepository.findOne({
      where: { id, userId },
      relations: { agent: true, steps: true },
      order: { steps: { position: 'ASC' } },
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }

    return execution;
  }

  async cancel(id: string, userId: string): Promise<Execution> {
    const execution = await this.findOne(id, userId);

    if (isTerminal(execution.status)) {
      throw new ConflictException(`Execution is already ${execution.status}`);
    }

    const cancelled = await this.state.transition(
      execution,
      ExecutionStatus.CANCELLED,
      { finishedAt: new Date() },
    );

    if (!cancelled) {
      throw new ConflictException(
        'Execution status was changed by another process',
      );
    }

    await this.state.skipUnfinishedSteps(id);

    return this.findOne(id, userId);
  }
}
