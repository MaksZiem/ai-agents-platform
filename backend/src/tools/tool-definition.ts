import type { z } from 'zod';

export type ToolResource = 'financial_data' | 'documents' | 'email';

export type ToolAction = 'read' | 'search' | 'modify' | 'delete' | 'send';

export interface ToolPermission {
  resource: ToolResource;
  action: ToolAction;
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
  execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>;
}

export function defineTool<TInput extends z.ZodType, TOutput extends z.ZodType>(
  tool: ToolDefinition<TInput, TOutput>,
): ToolDefinition<TInput, TOutput> {
  return tool;
}
