import type { z } from 'zod';
import type {
  ConnectionRequest,
  ConnectionResponse,
} from '../connections/connections.service.js';
import type {
  DocumentSearchHit,
  DocumentText,
} from '../knowledge/knowledge-search.js';
import type { WebPage, WebSearchResult } from '../web/web.service.js';

export type ToolResource =
  'financial_data' | 'documents' | 'reports' | 'email' | 'web' | 'connections';

export type ToolAction =
  'read' | 'search' | 'modify' | 'delete' | 'create' | 'send';

export interface ToolPermission {
  resource: ToolResource;
  action: ToolAction;
}

// What a tool may use besides its input. Built by the ToolExecutor for one
// agent, so a tool can never reach another agent's data.
export interface ToolFileInput {
  name: string;
  mimeType: string;
  content: string;
}

export interface SavedToolFile {
  id: string;
  name: string;
  sizeBytes: number;
}

export interface ToolEmail {
  to: string;
  subject: string;
  body: string;
  attachmentFileId?: string;
}

export interface ToolContext {
  agentId: string;
  executionId: string;
  searchDocuments(query: string, limit: number): Promise<DocumentSearchHit[]>;
  readDocuments(documentId?: string): Promise<DocumentText[]>;
  saveFile(file: ToolFileInput): Promise<SavedToolFile>;
  sendEmail(
    email: ToolEmail,
  ): Promise<{ messageId: string; attachment: string | null }>;
  webSearch(query: string, maxResults: number): Promise<WebSearchResult[]>;
  fetchUrl(url: string): Promise<WebPage>;
  httpRequest(request: ConnectionRequest): Promise<ConnectionResponse>;
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
  permissionFor?(input: z.infer<TInput>): ToolPermission;
  requiresApproval: boolean;
  needsApproval?(input: z.infer<TInput>): boolean;
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
