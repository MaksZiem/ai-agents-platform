import type { ExecutionWithAgent } from "@/features/executions/types";

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

export type ApprovalWithExecution = Approval & {
  execution: ExecutionWithAgent;
};
