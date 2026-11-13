import type { ApprovalWithExecution } from "@/features/approvals/types";
import type { ExecutionWithAgent } from "@/features/executions/types";

export type DashboardStats = {
  agents: number;
  tasksToday: number;
  running: number;
  waitingForApproval: number;
};

export type DayActivity = {
  date: string;
  completed: number;
  failed: number;
  cancelled: number;
  active: number;
};

export type UsageSummary = {
  executions: number;
  completed: number;
  failed: number;
  tokens: number;
  llmCalls: number;
  avgDurationMs: number | null;
  retries: number;
};

export type ToolUsage = {
  toolName: string;
  calls: number;
  failed: number;
};

export type DashboardSummary = DashboardStats & {
  recentExecutions: ExecutionWithAgent[];
  activity: DayActivity[];
  usage: UsageSummary;
  topTools: ToolUsage[];
  attention: {
    approvals: ApprovalWithExecution[];
    failures: ExecutionWithAgent[];
  };
};
