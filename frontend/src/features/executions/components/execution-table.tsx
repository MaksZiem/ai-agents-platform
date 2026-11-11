import Link from "next/link";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import { ExecutionStatusBadge } from "@/features/executions/components/execution-status-badge";
import { formatDuration, formatExecutionDate, getDurationMs } from "@/lib/format";
import type { ExecutionWithAgent } from "@/features/executions/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_200px_170px_80px_112px]";

type ExecutionTableProps = {
  executions: ExecutionWithAgent[];
  emptyMessage: string;
};

export function ExecutionTable({ executions, emptyMessage }: ExecutionTableProps) {
  if (executions.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-fg-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>Task</span>
        <span className="hidden md:block">Agent</span>
        <span>Status</span>
        <span className="hidden text-right md:block">Duration</span>
        <span className="hidden text-right md:block">Started</span>
      </div>

      <ul className="divide-y divide-border">
        {executions.map((execution) => {
          const durationMs = getDurationMs(execution);

          return (
            <li
              key={execution.id}
              className={`${ROW_GRID} relative px-[18px] py-2.5 transition-colors hover:bg-surface-hover`}
            >
              <div className="min-w-0">
                <Link
                  href={`/executions/${execution.id}`}
                  className="block truncate font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                >
                  {execution.task}
                </Link>
                <p className="truncate font-mono text-xs text-fg-muted">
                  <span className="md:hidden">{execution.agent.name} · </span>
                  {execution.model ?? "—"}
                </p>
              </div>
              <Link
                href={`/agents/${execution.agent.id}`}
                className="relative z-10 hidden min-w-0 items-center gap-2 rounded-md text-[13px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex"
              >
                <AgentAvatar name={execution.agent.name} icon={execution.agent.icon} />
                <span className="truncate">{execution.agent.name}</span>
              </Link>
              <ExecutionStatusBadge status={execution.status} />
              <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                {durationMs === null ? "—" : formatDuration(durationMs)}
              </span>
              <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                {formatExecutionDate(execution.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
