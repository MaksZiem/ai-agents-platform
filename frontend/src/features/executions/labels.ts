import { EXECUTION_STATUSES, type ExecutionStatus } from "@/features/executions/types";

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  WAITING_FOR_APPROVAL: "Waiting for approval",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export function isExecutionStatus(value: unknown): value is ExecutionStatus {
  return (
    typeof value === "string" &&
    (EXECUTION_STATUSES as readonly string[]).includes(value)
  );
}
