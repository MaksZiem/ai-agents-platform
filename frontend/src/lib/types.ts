export const EXECUTION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export type DashboardStats = {
  agents: number;
  tasksToday: number;
  running: number;
  waitingForApproval: number;
};

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

export type AgentSummary = {
  id: string;
  name: string;
  icon: string | null;
};

export type ExecutionWithAgent = Execution & {
  agent: AgentSummary;
};

export type DashboardSummary = DashboardStats & {
  recentExecutions: ExecutionWithAgent[];
};
