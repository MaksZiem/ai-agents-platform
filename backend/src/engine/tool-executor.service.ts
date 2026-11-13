import { createHash } from 'node:crypto';
import { HttpException, Injectable } from '@nestjs/common';
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
import { ConnectionsService } from '../connections/connections.service.js';
import { SafeFetchError } from '../web/safe-fetch.js';
import { WebService } from '../web/web.service.js';
import { ToolExecutionError } from './tool-execution.error.js';

export interface ToolExecutionRequest {
  agentId: string;
  executionId: string;
  userId: string;
  toolName: string;
  input: unknown;
  approved?: boolean;
  answer?: string | null;
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
    private readonly webService: WebService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  async execute({
    agentId,
    executionId,
    userId,
    toolName,
    input,
    approved = false,
    answer = null,
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

    const parsedInput = tool.inputSchema.safeParse(input);

    if (!parsedInput.success) {
      throw new ToolExecutionError(
        'INVALID_INPUT',
        z.prettifyError(parsedInput.error),
      );
    }

    const permission =
      tool.permissionFor?.(parsedInput.data) ?? tool.permission;

    if (permission) {
      const hasPermission = await this.agentPermissionsRepository.existsBy({
        agentId,
        resource: permission.resource,
        action: permission.action,
      });

      if (!hasPermission) {
        throw new ToolExecutionError(
          'PERMISSION_DENIED',
          `Agent is missing permission ${permission.resource}:${permission.action}`,
        );
      }
    }

    const needsApproval =
      tool.requiresApproval ||
      agentTool.requiresApproval ||
      (tool.needsApproval?.(parsedInput.data) ?? false);

    if (needsApproval && !approved) {
      return { status: 'approval_required', input: parsedInput.data };
    }

    let output: unknown;

    try {
      output = await tool.execute(
        parsedInput.data,
        this.createContext({ agentId, executionId, userId, answer }),
      );
    } catch (error) {
      if (error instanceof ToolExecutionError) {
        throw error;
      }

      if (error instanceof SafeFetchError) {
        throw new ToolExecutionError(
          'EXECUTION_FAILED',
          error.message,
          error.retryable,
        );
      }

      if (error instanceof HttpException) {
        throw new ToolExecutionError('INVALID_INPUT', error.message);
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
    answer,
  }: Pick<ToolExecutionRequest, 'agentId' | 'executionId' | 'userId'> & {
    answer: string | null;
  }): ToolContext {
    return {
      agentId,
      executionId,
      searchDocuments: (query, limit) =>
        this.knowledgeService.search(agentId, query, limit),
      readDocuments: (documentId) =>
        this.knowledgeService.readForAgent(agentId, documentId),
      listDocuments: () => this.knowledgeService.listForAgent(agentId),
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
      webSearch: (query, maxResults) =>
        this.webService.search(query, maxResults),
      fetchUrl: (url) => this.webService.fetchPage(url),
      httpRequest: (request) =>
        this.connectionsService.request(agentId, request),
      userAnswer: answer,
    };
  }
}
