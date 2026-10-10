import type { Agent } from '../agents/entities/agent.entity.js';
import type { StepStatus } from '../executions/execution-step-enums.js';
import type { ToolDefinition } from '../tools/tool-definition.js';

export interface PlannedToolCall {
  toolName: string;
  input: Record<string, unknown>;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface PlanningContext {
  task: string;
  agent: Pick<
    Agent,
    'instructions' | 'model' | 'temperature' | 'maxOutputTokens'
  >;
  tools: ToolDefinition[];
}

export interface PlanResult {
  toolCalls: PlannedToolCall[];
  // null when no model was called.
  usage: LlmUsage | null;
}

export interface ToolCallResult {
  toolName: string;
  input: Record<string, unknown> | null;
  status: StepStatus;
  output: Record<string, unknown> | null;
  error: string | null;
}

export interface AnswerContext extends Omit<PlanningContext, 'tools'> {
  results: ToolCallResult[];
}

export interface AnswerResult {
  answer: string;
  usage: LlmUsage | null;
}

// An abstract class instead of an interface: it survives compilation,
// so Nest can use it as the injection token.
export abstract class Planner {
  abstract plan(context: PlanningContext): Promise<PlanResult>;

  abstract answer(context: AnswerContext): Promise<AnswerResult>;
}
