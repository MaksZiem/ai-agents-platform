import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { ToolContext } from '../tools/tool-definition.js';
import { ToolsService } from '../tools/tools.service.js';
import { ToolExecutionError } from './tool-execution.error.js';

export interface ToolExecutionRequest {
  agentId: string;
  toolName: string;
  input: unknown;
  approved?: boolean;
}

export type ToolExecutionResult =
  | { status: 'completed'; output: unknown }
  | { status: 'approval_required'; input: unknown };

@Injectable()
export class ToolExecutor {
  constructor(
    @InjectRepository(AgentTool)
    private readonly agentToolsRepository: Repository<AgentTool>,
    @InjectRepository(AgentPermission)
    private readonly agentPermissionsRepository: Repository<AgentPermission>,
    private readonly toolsService: ToolsService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async execute({
    agentId,
    toolName,
    input,
    approved = false,
  }: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const tool = this.toolsService.find(toolName);

    if (!tool) {
      throw new ToolExecutionError(
        'TOOL_NOT_FOUND',
        `Tool ${toolName} does not exist`,
      );
    }

    const agentTool = await this.agentToolsRepository.findOneBy({
      agentId,
      toolName,
    });

    if (!agentTool) {
      throw new ToolExecutionError(
        'TOOL_NOT_ENABLED',
        `Tool ${toolName} is not enabled for this agent`,
      );
    }

    const { resource, action } = tool.permission;
    const hasPermission = await this.agentPermissionsRepository.existsBy({
      agentId,
      resource,
      action,
    });

    if (!hasPermission) {
      throw new ToolExecutionError(
        'PERMISSION_DENIED',
        `Agent is missing permission ${resource}:${action}`,
      );
    }

    const parsedInput = tool.inputSchema.safeParse(input);

    if (!parsedInput.success) {
      throw new ToolExecutionError(
        'INVALID_INPUT',
        z.prettifyError(parsedInput.error),
      );
    }

    if ((tool.requiresApproval || agentTool.requiresApproval) && !approved) {
      return { status: 'approval_required', input: parsedInput.data };
    }

    let output: unknown;

    try {
      output = await tool.execute(
        parsedInput.data,
        this.createContext(agentId),
      );
    } catch (error) {
      throw new ToolExecutionError(
        'EXECUTION_FAILED',
        error instanceof Error ? error.message : String(error),
        true,
      );
    }

    const parsedOutput = tool.outputSchema.safeParse(output);

    if (!parsedOutput.success) {
      throw new ToolExecutionError(
        'INVALID_OUTPUT',
        z.prettifyError(parsedOutput.error),
      );
    }

    return { status: 'completed', output: parsedOutput.data };
  }

  private createContext(agentId: string): ToolContext {
    return {
      agentId,
      searchDocuments: (query, limit) =>
        this.knowledgeService.search(agentId, query, limit),
    };
  }
}
