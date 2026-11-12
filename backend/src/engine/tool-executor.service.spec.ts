import { z } from 'zod';
import type { Repository } from 'typeorm';
import type { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import type { AgentTool } from '../agents/entities/agent-tool.entity.js';
import type { EmailService } from '../email/email.service.js';
import type { FilesService } from '../files/files.service.js';
import type { KnowledgeService } from '../knowledge/knowledge.service.js';
import type { ConnectionsService } from '../connections/connections.service.js';
import type { ToolsService } from '../tools/tools.service.js';
import type { WebService } from '../web/web.service.js';
import { defineTool, type ToolDefinition } from '../tools/tool-definition.js';
import { ToolExecutionError } from './tool-execution.error.js';
import { ToolExecutor } from './tool-executor.service.js';

const echoTool = defineTool({
  name: 'echo',
  description: 'Returns the given text.',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ text: z.string() }),
  permission: { resource: 'documents', action: 'read' },
  requiresApproval: false,
  execute: async ({ text }) => ({ text }),
});

function createExecutor({
  tool = echoTool as ToolDefinition,
  agentTool = { requiresApproval: false } as AgentTool | null,
  hasPermission = true as boolean | ((action: string) => boolean),
} = {}) {
  const toolsService = {
    find: (name: string) => (name === tool.name ? tool : undefined),
  } as unknown as ToolsService;
  const agentToolsRepository = {
    findOneBy: async () => agentTool,
  } as unknown as Repository<AgentTool>;
  const agentPermissionsRepository = {
    existsBy: async ({ action }: { action: string }) =>
      typeof hasPermission === 'function'
        ? hasPermission(action)
        : hasPermission,
  } as unknown as Repository<AgentPermission>;

  const knowledgeService = {
    search: async () => [],
  } as unknown as KnowledgeService;

  return new ToolExecutor(
    agentToolsRepository,
    agentPermissionsRepository,
    toolsService,
    knowledgeService,
    {} as FilesService,
    {} as EmailService,
    {} as WebService,
    {} as ConnectionsService,
  );
}

async function expectToolError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(ToolExecutionError);
  await expect(promise).rejects.toMatchObject({ code });
}

const request = {
  agentId: 'agent-1',
  executionId: 'execution-1',
  userId: 'user-1',
  toolName: 'echo',
  input: { text: 'hi' },
};

describe('ToolExecutor', () => {
  it('executes an enabled and permitted tool', async () => {
    const result = await createExecutor().execute(request);

    expect(result).toEqual({ status: 'completed', output: { text: 'hi' } });
  });

  it('rejects an unknown tool', async () => {
    await expectToolError(
      createExecutor().execute({ ...request, toolName: 'nope' }),
      'TOOL_NOT_FOUND',
    );
  });

  it('rejects a tool that is not enabled for the agent', async () => {
    await expectToolError(
      createExecutor({ agentTool: null }).execute(request),
      'TOOL_NOT_ENABLED',
    );
  });

  it('rejects a tool when the agent lacks the permission', async () => {
    await expectToolError(
      createExecutor({ hasPermission: false }).execute(request),
      'PERMISSION_DENIED',
    );
  });

  it('rejects invalid input', async () => {
    await expectToolError(
      createExecutor().execute({ ...request, input: { text: 42 } }),
      'INVALID_INPUT',
    );
  });

  it('asks for approval when the tool requires it', async () => {
    const tool = { ...echoTool, requiresApproval: true };
    const result = await createExecutor({ tool }).execute(request);

    expect(result).toEqual({
      status: 'approval_required',
      input: { text: 'hi' },
    });
  });

  it('asks for approval when the agent configuration requires it', async () => {
    const agentTool = { requiresApproval: true } as AgentTool;
    const result = await createExecutor({ agentTool }).execute(request);

    expect(result.status).toBe('approval_required');
  });

  it('executes an approval-required tool once approved', async () => {
    const tool = { ...echoTool, requiresApproval: true };
    const result = await createExecutor({ tool }).execute({
      ...request,
      approved: true,
    });

    expect(result.status).toBe('completed');
  });

  it('skips the permission check for a tool without a permission', async () => {
    const tool = { ...echoTool, permission: null };
    const result = await createExecutor({
      tool,
      hasPermission: false,
    }).execute(request);

    expect(result.status).toBe('completed');
  });

  it("passes the user's answer to the tool", async () => {
    const tool = defineTool({
      ...echoTool,
      requiresApproval: true,
      execute: async (_input, context) => ({
        text: context.userAnswer ?? '',
      }),
    }) as ToolDefinition;
    const result = await createExecutor({ tool }).execute({
      ...request,
      approved: true,
      answer: 'Q3',
    });

    expect(result).toEqual({ status: 'completed', output: { text: 'Q3' } });
  });

  it('marks a failing tool as a retryable execution error', async () => {
    const tool = {
      ...echoTool,
      execute: async () => {
        throw new Error('Upstream timeout');
      },
    };
    const promise = createExecutor({ tool }).execute(request);

    await expect(promise).rejects.toMatchObject({
      code: 'EXECUTION_FAILED',
      retryable: true,
      message: 'Upstream timeout',
    });
  });

  it('rejects output that does not match the output schema', async () => {
    const tool = {
      ...echoTool,
      execute: async () => ({ text: 123 }) as unknown as { text: string },
    };

    await expectToolError(
      createExecutor({ tool }).execute(request),
      'INVALID_OUTPUT',
    );
  });

  describe('input-dependent permission and approval', () => {
    const writeTool = defineTool({
      name: 'echo',
      description: 'Reads or writes.',
      inputSchema: z.object({ text: z.string(), write: z.boolean() }),
      outputSchema: z.object({ text: z.string() }),
      permission: { resource: 'connections', action: 'read' },
      permissionFor: ({ write }) => ({
        resource: 'connections',
        action: write ? 'modify' : 'read',
      }),
      requiresApproval: false,
      needsApproval: ({ write }) => write,
      execute: async ({ text }) => ({ text }),
    });
    const readOnly = (action: string) => action === 'read';

    it('runs a read without approval', async () => {
      const result = await createExecutor({
        tool: writeTool,
        hasPermission: readOnly,
      }).execute({ ...request, input: { text: 'hi', write: false } });

      expect(result).toEqual({ status: 'completed', output: { text: 'hi' } });
    });

    it('checks the permission for the requested action', async () => {
      await expectToolError(
        createExecutor({ tool: writeTool, hasPermission: readOnly }).execute({
          ...request,
          input: { text: 'hi', write: true },
        }),
        'PERMISSION_DENIED',
      );
    });

    it('asks for approval when the input needs it', async () => {
      const result = await createExecutor({ tool: writeTool }).execute({
        ...request,
        input: { text: 'hi', write: true },
      });

      expect(result).toEqual({
        status: 'approval_required',
        input: { text: 'hi', write: true },
      });
    });
  });
});
