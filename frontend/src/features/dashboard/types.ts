import type { ExecutionWithAgent } from "@/features/executions/types";

export type DashboardStats = {
  agents: number;
  tasksToday: number;
  running: number;
  waitingForApproval: number;
};

export type DashboardSummary = DashboardStats & {
  recentExecutions: ExecutionWithAgent[];
};
