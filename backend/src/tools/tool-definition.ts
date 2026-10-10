import type { z } from 'zod';
import type { DocumentSearchHit } from '../knowledge/knowledge-search.js';

export type ToolResource = 'financial_data' | 'documents' | 'reports' | 'email';

export type ToolAction =
  'read' | 'search' | 'modify' | 'delete' | 'create' | 'send';

export interface ToolPermission {
  resource: ToolResource;
  action: ToolAction;
}

// What a tool may use besides its input. Built by the ToolExecutor for one
// agent, so a tool can never reach another agent's data.
export interface ToolContext {
  agentId: string;
  searchDocuments(query: string, limit: number): Promise<DocumentSearchHit[]>;
}

export interface ToolDefinition<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  permission: ToolPermission;
  requiresApproval: boolean;
  execute(
    input: z.infer<TInput>,
    context: ToolContext,
  ): Promise<z.infer<TOutput>>;
}

export function defineTool<TInput extends z.ZodType, TOutput extends z.ZodType>(
  tool: ToolDefinition<TInput, TOutput>,
): ToolDefinition<TInput, TOutput> {
  return tool;
}
