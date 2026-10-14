import type { AgentSummary } from "@/features/agents/types";

export const EXECUTION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export type Execution = {
  id: string;
  agentId: string;
  task: string;
  status: ExecutionStatus;
  result: string | null;
  error: string | null;
  model: string | null;
  llmCalls: number;
  inputTokens: number;
  outputTokens: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExecutionWithAgent = Execution & {
  agent: AgentSummary;
};

export type StepType = "PLAN" | "TOOL_CALL" | "FINAL_ANSWER";

export type StepStatus =
  | "PENDING"
  | "RUNNING"
  | "WAITING_FOR_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export type ExecutionStep = {
  id: string;
  executionId: string;
  position: number;
  type: StepType;
  status: StepStatus;
  toolName: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  attempt: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export type ExecutionMetrics = {
  durationMs: number | null;
  llmCalls: number;
  toolCalls: number;
  retries: number;
  failedSteps: number;
  approvalRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ExecutionDetail = ExecutionWithAgent & {
  steps: ExecutionStep[];
  metrics: ExecutionMetrics;
};
