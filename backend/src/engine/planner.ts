import type { Agent } from '../agents/entities/agent.entity.js';
import type { ToolDefinition } from '../tools/tool-definition.js';

export interface ModelToolCall {
  id?: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ModelTurn {
  text: string | null;
  toolCalls: ModelToolCall[];
  raw: unknown;
  usage: LlmUsage | null;
}

export type ToolResultStatus = 'completed' | 'failed' | 'rejected';

export interface ToolResult {
  call: ModelToolCall;
  status: ToolResultStatus;
  output: Record<string, unknown> | null;
  error: string | null;
}

export type HistoryEntry =
  { kind: 'model'; turn: ModelTurn } | { kind: 'tool'; result: ToolResult };

export interface TurnContext {
  task: string;
  agent: Pick<
    Agent,
    'instructions' | 'model' | 'temperature' | 'maxOutputTokens'
  >;
  tools: ToolDefinition[];
  notes?: string[];
  history: HistoryEntry[];
  signal?: AbortSignal;
}

export abstract class Planner {
  abstract next(context: TurnContext): Promise<ModelTurn>;
}
