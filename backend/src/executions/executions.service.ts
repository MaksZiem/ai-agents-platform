import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentsService } from '../agents/agents.service.js';
import { AgentStatus } from '../agents/entities/agent.entity.js';
import { Execution } from './entities/execution.entity.js';
import {
  canTransition,
  ExecutionStatus,
  isTerminal,
} from './execution-status.js';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    private readonly agentsService: AgentsService,
  ) {}

  async create(agentId: string, task: string, userId: string) {
    const agent = await this.agentsService.findOne(agentId, userId);

    if (agent.status !== AgentStatus.ACTIVE) {
      throw new ConflictException('Agent is inactive');
    }

    const execution = this.executionsRepository.create({
      agentId,
      userId,
      task,
    });

    return this.executionsRepository.save(execution);
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
      relations: { agent: true },
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

    await this.transition(execution, ExecutionStatus.CANCELLED, {
      finishedAt: new Date(),
    });

    return this.findOne(id, userId);
  }

  private async transition(
    execution: Execution,
    to: ExecutionStatus,
    changes: Partial<Execution> = {},
  ): Promise<void> {
    if (!canTransition(execution.status, to)) {
      throw new ConflictException(
        `Cannot change execution status from ${execution.status} to ${to}`,
      );
    }

    const result = await this.executionsRepository.update(
      { id: execution.id, status: execution.status },
      { ...changes, status: to },
    );

    if (result.affected !== 1) {
      throw new ConflictException(
        'Execution status was changed by another process',
      );
    }
  }
}
