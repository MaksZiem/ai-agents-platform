import Link from "next/link";
import { Bot } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import { AgentStatusBadge } from "@/features/agents/components/agent-status-badge";
import { formatShortDate } from "@/lib/format";
import type { Agent } from "@/features/agents/types";

const ROW_GRID = "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_180px_96px_112px]";

type AgentListProps = {
  agents: Agent[];
};

export function AgentList({ agents }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <Bot className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="text-sm">No agents yet</p>
          <p className="text-[13px] text-fg-muted">
            Create an agent, give it tools and permissions, then delegate a task.
          </p>
        </div>
        <Link href="/agents/new" className={buttonClasses("primary")}>
          New agent
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}>
        <span>Agent</span>
        <span className="hidden md:block">Model</span>
        <span>Status</span>
        <span className="hidden text-right md:block">Created</span>
      </div>

      <ul className="divide-y divide-border">
        {agents.map((agent) => (
          <li key={agent.id}>
            <Link
              href={`/agents/${agent.id}`}
              className={`${ROW_GRID} px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AgentAvatar name={agent.name} icon={agent.icon} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{agent.name}</p>
                  {agent.description && (
                    <p className="truncate text-[13px] text-fg-muted">
                      {agent.description}
                    </p>
                  )}
                </div>
              </div>
              <span className="hidden truncate font-mono text-[13px] text-fg-muted md:block">
                {agent.model}
              </span>
              <AgentStatusBadge status={agent.status} />
              <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                {formatShortDate(agent.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
