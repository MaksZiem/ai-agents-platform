import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AgentPermission } from './entities/agent-permission.entity.js';
import { AgentTool } from './entities/agent-tool.entity.js';
import { Agent } from './entities/agent.entity.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(userId: string): Promise<Agent[]> {
    return this.agentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOneBy({ id, userId });

    if (!agent) {
      throw new NotFoundException(`Agent ${id} not found`);
    }

    return agent;
  }

  create(dto: CreateAgentDto, userId: string): Promise<Agent> {
    const agent = this.agentsRepository.create({ ...dto, userId });
    return this.agentsRepository.save(agent);
  }

  async duplicate(id: string, userId: string): Promise<Agent> {
    const source = await this.findOne(id, userId);

    return this.dataSource.transaction(async (manager) => {
      const copy = await manager.save(
        manager.create(Agent, {
          name: `${source.name} (copy)`,
          description: source.description,
          instructions: source.instructions,
          status: source.status,
          provider: source.provider,
          model: source.model,
          temperature: source.temperature,
          maxOutputTokens: source.maxOutputTokens,
          userId,
        }),
      );

      const sourceTools = await manager.findBy(AgentTool, {
        agentId: source.id,
      });

      await manager.save(
        sourceTools.map((tool) =>
          manager.create(AgentTool, {
            agentId: copy.id,
            toolName: tool.toolName,
            requiresApproval: tool.requiresApproval,
          }),
        ),
      );

      const sourcePermissions = await manager.findBy(AgentPermission, {
        agentId: source.id,
      });

      await manager.save(
        sourcePermissions.map((permission) =>
          manager.create(AgentPermission, {
            agentId: copy.id,
            resource: permission.resource,
            action: permission.action,
          }),
        ),
      );

      return copy;
    });
  }

  async update(
    id: string,
    dto: UpdateAgentDto,
    userId: string,
  ): Promise<Agent> {
    const agent = await this.findOne(id, userId);
    this.agentsRepository.merge(agent, dto);
    return this.agentsRepository.save(agent);
  }

  async remove(id: string, userId: string): Promise<void> {
    const agent = await this.findOne(id, userId);
    await this.agentsRepository.remove(agent);
  }
}
