import type { Agent } from '../agents/entities/agent.entity.js';
import type { ToolDefinition } from '../tools/tool-definition.js';

export interface PlannedToolCall {
  toolName: string;
  input: Record<string, unknown>;
}

export interface PlanningContext {
  task: string;
  agent: Pick<
    Agent,
    'instructions' | 'model' | 'temperature' | 'maxOutputTokens'
  >;
  tools: ToolDefinition[];
}

// An abstract class instead of an interface: it survives compilation,
// so Nest can use it as the injection token.
export abstract class Planner {
  abstract plan(context: PlanningContext): Promise<PlannedToolCall[]>;
}
