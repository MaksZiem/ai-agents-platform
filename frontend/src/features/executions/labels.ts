import { EXECUTION_STATUSES, type ExecutionStatus } from "@/features/executions/types";

export function isExecutionStatus(value: unknown): value is ExecutionStatus {
  return (
    typeof value === "string" &&
    (EXECUTION_STATUSES as readonly string[]).includes(value)
  );
}

const ACTIVE_STATUSES: readonly ExecutionStatus[] = [
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
];

export function isActiveStatus(status: ExecutionStatus) {
  return ACTIVE_STATUSES.includes(status);
}
