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

export type AgentSummary = Pick<Agent, "id" | "name" | "icon">;

export type ExecutionWithAgent = Execution & {
  agent: AgentSummary;
};

export type DashboardSummary = DashboardStats & {
  recentExecutions: ExecutionWithAgent[];
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

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type Approval = {
  id: string;
  executionId: string;
  stepId: string;
  toolName: string;
  input: Record<string, unknown>;
  reason: string | null;
  status: ApprovalStatus;
  decidedAt: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string
}

export type AuthResponse = {
  accessToken: string;
  user: User;
}

export type AgentStatus = "ACTIVE" | "INACTIVE";

export type LlmProvider = "GEMINI";

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  instructions: string;
  status: AgentStatus;
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  createdAt: string;
  updatedAt: string;
};

export type ToolResource = "financial_data" | "documents" | "reports" | "email";

export type ToolAction = "read" | "search" | "modify" | "delete" | "create" | "send";

export type ToolPermission = {
  resource: ToolResource;
  action: ToolAction;
};

export type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  permission: ToolPermission;
  requiresApproval: boolean;
};

export type AgentTool = {
  toolName: string;
  description: string;
  permission: ToolPermission;
  requiresApproval: boolean;
  enabledAt: string;
};

export type ResourcePermissions = {
  resource: ToolResource;
  actions: { action: ToolAction; granted: boolean }[];
};

export type ApprovalWithExecution = Approval & {
  execution: ExecutionWithAgent;
};
