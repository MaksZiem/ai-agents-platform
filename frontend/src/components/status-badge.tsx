import type { ExecutionStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; badge: string; dot: string }
> = {
  QUEUED: {
    label: "Queued",
    badge: "border-border bg-surface-2 text-fg-muted",
    dot: "border border-fg-muted",
  },
  RUNNING: {
    label: "Running",
    badge: "border-accent/30 bg-accent/10 text-accent",
    dot: "bg-accent animate-pulse motion-reduce:animate-none",
  },
  WAITING_FOR_APPROVAL: {
    label: "Waiting for approval",
    badge: "border-warning/30 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  COMPLETED: {
    label: "Completed",
    badge: "border-success/30 bg-success/10 text-success",
    dot: "bg-success",
  },
  FAILED: {
    label: "Failed",
    badge: "border-danger/30 bg-danger/10 text-danger",
    dot: "bg-danger",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "border-border bg-surface-2 text-fg-muted",
    dot: "bg-fg-subtle",
  },
};

type StatusBadgeProps = {
  status: ExecutionStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, badge, dot } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
