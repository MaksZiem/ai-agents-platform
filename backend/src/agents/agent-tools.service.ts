import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentTool } from './entities/agent-tool.entity.js';
import { Repository } from 'typeorm';
import { AgentsService } from './agents.service.js';
import { ToolsService } from '../tools/tools.service.js';
import { EnableAgentToolDto } from './dto/enable-agent-tool.dto.js';

@Injectable()
export class AgentToolsService {
  constructor(
    @InjectRepository(AgentTool)
    private readonly agentToolsRepository: Repository<AgentTool>,
    private readonly agentsService: AgentsService,
    private readonly toolsService: ToolsService,
  ) {}

  async findAll(agentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const agentTools = await this.agentToolsRepository.find({
      where: { agentId },
      order: { createdAt: 'ASC' },
    });

    return agentTools.map((agentTool) => this.toResponse(agentTool));
  }

  async enable(
    agentId: string,
    toolName: string,
    dto: EnableAgentToolDto,
    userId: string,
  ) {
    await this.agentsService.findOne(agentId, userId);
    this.toolsService.get(toolName);

    const agentTool =
      (await this.agentToolsRepository.findOneBy({ agentId, toolName })) ??
      this.agentToolsRepository.create({ agentId, toolName });

    agentTool.requiresApproval = dto.requiresApproval ?? false;

    return this.toResponse(await this.agentToolsRepository.save(agentTool));
  }

  async disable(agentId: string, toolName: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const agentTool = await this.agentToolsRepository.findOneBy({
      agentId,
      toolName,
    });

    if (!agentTool) {
      throw new NotFoundException(
        `Tool ${toolName} is not enabled for this agent`,
      );
    }

    await this.agentToolsRepository.remove(agentTool);
  }

  private toResponse(agentTool: AgentTool) {
    const tool = this.toolsService.get(agentTool.toolName);

    return {
      toolName: tool.name,
      description: tool.description,
      permission: tool.permission,
      requiresApproval: tool.requiresApproval || agentTool.requiresApproval,
      enabledAt: agentTool.createdAt,
    };
  }
}
