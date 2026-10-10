import type { Agent } from '../agents/entities/agent.entity.js';
import type { ToolDefinition } from '../tools/tool-definition.js';

export interface ModelToolCall {
  // Provider-assigned id, sent back with the result when present.
  id?: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

// One model response: either tool calls to run next, or the final answer.
export interface ModelTurn {
  text: string | null;
  toolCalls: ModelToolCall[];
  // The provider's own message, replayed verbatim on the next turn
  // (Gemini needs its thought signatures back).
  raw: unknown;
  // null when no model was called.
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
  history: HistoryEntry[];
}

// An abstract class instead of an interface: it survives compilation,
// so Nest can use it as the injection token.
export abstract class Planner {
  abstract next(context: TurnContext): Promise<ModelTurn>;
}
