export enum ExecutionStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

const ALLOWED_TRANSITIONS: Record<ExecutionStatus, readonly ExecutionStatus[]> =
  {
    [ExecutionStatus.QUEUED]: [
      ExecutionStatus.RUNNING,
      ExecutionStatus.CANCELLED,
    ],
    [ExecutionStatus.RUNNING]: [
      ExecutionStatus.WAITING_FOR_APPROVAL,
      ExecutionStatus.COMPLETED,
      ExecutionStatus.FAILED,
      ExecutionStatus.CANCELLED,
    ],
    [ExecutionStatus.WAITING_FOR_APPROVAL]: [
      ExecutionStatus.RUNNING,
      ExecutionStatus.FAILED,
      ExecutionStatus.CANCELLED,
    ],
    [ExecutionStatus.COMPLETED]: [],
    [ExecutionStatus.FAILED]: [],
    [ExecutionStatus.CANCELLED]: [],
  };

export function canTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: ExecutionStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
