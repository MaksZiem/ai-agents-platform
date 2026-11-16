import { useTranslations } from "next-intl";
import type { AgentStatus } from "@/features/agents/types";

const AGENT_STATUS_CLASSES: Record<AgentStatus, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  INACTIVE: "border-border bg-surface-2 text-fg-muted",
};

type AgentStatusBadgeProps = {
  status: AgentStatus;
};

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const t = useTranslations("agents.status");
  const className = AGENT_STATUS_CLASSES[status];

  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {t(status)}
    </span>
  );
}
