import Link from "next/link";
import { AgentStatusBadge } from "@/features/agents/components/agent-status-badge";
import {
  AgentActivityPanel,
  getAgentState,
} from "@/features/agents/components/agent-activity";
import type { AgentWithActivity } from "@/features/agents/types";

function WorkingAvatar({ name, state }: { name: string; state: string }) {
  const ring =
    state === "working"
      ? "border-t-accent border-r-accent/40"
      : state === "waiting"
        ? "border-t-warning border-r-warning/40"
        : null;

  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center">
      {ring && (
        <span
          className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent motion-reduce:animate-none ${ring}`}
          style={{ animationDuration: state === "waiting" ? "3s" : "1.2s" }}
          aria-hidden
        />
      )}
      <span
        className={`flex size-8 items-center justify-center rounded-full border text-sm font-semibold ${
          ring
            ? "border-transparent bg-surface-2 text-fg"
            : "border-border bg-surface-2 text-fg-muted"
        }`}
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

function successRate(completed: number, total: number) {
  return total === 0 ? "—" : `${Math.round((completed / total) * 100)}%`;
}

export function AgentGrid({ agents }: { agents: AgentWithActivity[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => {
        const state = getAgentState(agent.activity);
        const isBusy = state === "working" || state === "waiting";
        const runs = agent.activity?.totalRuns ?? 0;

        return (
          <li
            key={agent.id}
            className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-surface p-[18px] transition-colors duration-150 ease-out hover:bg-surface-hover ${
              state === "working"
                ? "border-accent/40"
                : state === "waiting"
                  ? "border-warning/40"
                  : "border-border hover:border-border-strong"
            } ${agent.status === "INACTIVE" ? "opacity-60" : ""}`}
          >
            {isBusy && (
              <span
                className="absolute inset-x-0 top-0 h-0.5 overflow-hidden"
                aria-hidden
              >
                <span
                  className={`block h-full w-1/3 animate-indeterminate motion-reduce:w-full motion-reduce:animate-none ${
                    state === "working" ? "bg-accent" : "bg-warning"
                  }`}
                />
              </span>
            )}

            <div className="flex items-start gap-3">
              <WorkingAvatar name={agent.name} state={state} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/agents/${agent.id}`}
                  className="block truncate text-base font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                >
                  {agent.name}
                </Link>
                <p className="truncate font-mono text-xs text-fg-muted">
                  {agent.model}
                </p>
              </div>
              <AgentStatusBadge status={agent.status} />
            </div>

            <p className="line-clamp-2 min-h-10 text-[13px] text-fg-muted">
              {agent.description || "No description."}
            </p>

            <AgentActivityPanel activity={agent.activity} />

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">
              <div>
                <dt className="text-xs text-fg-muted">Runs</dt>
                <dd className="font-mono text-sm">{runs}</dd>
              </div>
              <div>
                <dt className="text-xs text-fg-muted">Success</dt>
                <dd className="font-mono text-sm">
                  {successRate(agent.activity?.completedRuns ?? 0, runs)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-fg-muted">Failed</dt>
                <dd
                  className={`font-mono text-sm ${
                    (agent.activity?.failedRuns ?? 0) > 0 ? "text-danger" : ""
                  }`}
                >
                  {agent.activity?.failedRuns ?? 0}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
