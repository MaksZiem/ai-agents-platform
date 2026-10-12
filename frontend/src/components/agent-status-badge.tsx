import type { AgentStatus } from "@/lib/types";

const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-success/30 bg-success/10 text-success",
  },
  INACTIVE: {
    label: "Inactive",
    className: "border-border bg-surface-2 text-fg-muted",
  },
};

type AgentStatusBadgeProps = {
  status: AgentStatus;
};

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const { label, className } = AGENT_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
