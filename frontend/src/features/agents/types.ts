import type { ToolAction, ToolPermission, ToolResource } from "@/features/tools/types";

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

export type AgentSummary = Pick<Agent, "id" | "name" | "icon">;

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
