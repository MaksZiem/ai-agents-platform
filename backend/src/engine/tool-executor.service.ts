import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { EmailService } from '../email/email.service.js';
import { FilesService } from '../files/files.service.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { ToolContext } from '../tools/tool-definition.js';
import { ToolsService } from '../tools/tools.service.js';
import { ToolExecutionError } from './tool-execution.error.js';

export interface ToolExecutionRequest {
  agentId: string;
  executionId: string;
  userId: string;
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
    private readonly filesService: FilesService,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    agentId,
    executionId,
    userId,
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
        this.createContext({ agentId, executionId, userId }),
      );
    } catch (error) {
      if (error instanceof ToolExecutionError) {
        throw error;
      }

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

  private createContext({
    agentId,
    executionId,
    userId,
  }: Pick<
    ToolExecutionRequest,
    'agentId' | 'executionId' | 'userId'
  >): ToolContext {
    return {
      agentId,
      executionId,
      searchDocuments: (query, limit) =>
        this.knowledgeService.search(agentId, query, limit),
      readDocuments: (documentId) =>
        this.knowledgeService.readForAgent(agentId, documentId),
      saveFile: async (file) => {
        const saved = await this.filesService.create({
          ...file,
          userId,
          executionId,
        });
        return { id: saved.id, name: saved.name, sizeBytes: saved.sizeBytes };
      },
      sendEmail: async ({ to, subject, body, attachmentFileId }) => {
        const attachment = attachmentFileId
          ? await this.filesService.findWithContent(attachmentFileId, {
              executionId,
            })
          : null;

        if (attachmentFileId && !attachment) {
          throw new ToolExecutionError(
            'INVALID_INPUT',
            `File ${attachmentFileId} was not created in this execution`,
          );
        }

        const { id } = await this.emailService.send({
          to,
          subject,
          text: body,
          attachments: attachment
            ? [
                {
                  filename: attachment.file.name,
                  content: attachment.content,
                  contentType: attachment.file.mimeType,
                },
              ]
            : [],
          idempotencyKey: `send-email/${executionId}/${createHash('sha256')
            .update(JSON.stringify([to, subject, body, attachmentFileId]))
            .digest('hex')}`,
        });

        return { messageId: id, attachment: attachment?.file.name ?? null };
      },
    };
  }
}
