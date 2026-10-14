import Link from "next/link";
import { ExecutionStatusBadge } from "@/features/executions/components/execution-status-badge";
import { formatDuration, formatExecutionDate, getDurationMs } from "@/lib/format";
import type { ExecutionWithAgent } from "@/features/executions/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_170px_80px_112px]";

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
        <span>Execution</span>
        <span>Status</span>
        <span className="hidden text-right md:block">Duration</span>
        <span className="hidden text-right md:block">Started</span>
      </div>

      <ul className="divide-y divide-border">
        {executions.map((execution) => {
          const durationMs = getDurationMs(execution);

          return (
            <li key={execution.id}>
              <Link
                href={`/executions/${execution.id}`}
                className={`${ROW_GRID} px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <div className="min-w-0">
                  <p className="font-medium">{execution.agent.name}</p>
                  <p className="truncate text-[13px] text-fg-muted">{execution.task}</p>
                </div>
                <ExecutionStatusBadge status={execution.status} />
                <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                  {durationMs === null ? "—" : formatDuration(durationMs)}
                </span>
                <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                  {formatExecutionDate(execution.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
