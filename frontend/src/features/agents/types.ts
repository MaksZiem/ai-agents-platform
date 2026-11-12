import type { ToolAction, ToolPermission, ToolResource } from "@/features/tools/types";

export type AgentStatus = "ACTIVE" | "INACTIVE";

export type LlmProvider = "GEMINI";

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  instructions: string;
  status: AgentStatus;
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  createdAt: string;
  updatedAt: string;
};

export type AgentActivity = {
  agentId: string;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  lastRunAt: string | null;
  activeRuns: number;
  current: {
    executionId: string;
    status: "QUEUED" | "RUNNING" | "WAITING_FOR_APPROVAL";
    task: string;
    startedAt: string | null;
    step: string | null;
  } | null;
};

export type AgentWithActivity = Agent & {
  activity: AgentActivity | null;
};

export type AgentView = "grid" | "list";

export type AgentSummary = Pick<Agent, "id" | "name">;

export type AgentTool = {
  toolName: string;
  description: string;
  permission: ToolPermission | null;
  requiresApproval: boolean;
  enabledAt: string;
};

export type ResourcePermissions = {
  resource: ToolResource;
  actions: { action: ToolAction; granted: boolean }[];
};
