import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatExecutionDate } from "@/lib/format";
import type { ExecutionWithAgent } from "@/lib/types";

type RecentExecutionsProps = {
  executions: ExecutionWithAgent[];
};

export function RecentExecutions({ executions }: RecentExecutionsProps) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">Recent executions</h2>
        <Link
          href="/executions"
          className="text-[13px] text-fg-muted transition-colors hover:text-fg"
        >
          View all
        </Link>
      </div>

      {executions.length === 0 ? (
        <p className="px-[18px] py-8 text-center text-fg-muted">
          No executions yet. Start a task from one of your agents.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {executions.map((execution) => (
            <li key={execution.id}>
              <Link
                href={`/executions/${execution.id}`}
                className="grid grid-cols-[1fr_auto_112px] items-center gap-4 px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <div className="min-w-0">
                  <p className="font-medium">{execution.agent.name}</p>
                  <p className="truncate text-[13px] text-fg-muted">
                    {execution.task}
                  </p>
                </div>
                <StatusBadge status={execution.status} />
                <span className="text-right font-mono text-xs text-fg-muted">
                  {formatExecutionDate(execution.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
