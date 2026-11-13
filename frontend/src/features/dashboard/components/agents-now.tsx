import Link from "next/link";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import {
  AgentActivityInline,
  getAgentState,
} from "@/features/agents/components/agent-activity";
import type { AgentWithActivity } from "@/features/agents/types";

const STATE_ORDER = { working: 0, waiting: 1, idle: 2, new: 3 };
const MAX_AGENTS = 6;

function lastRun(agent: AgentWithActivity) {
  return agent.activity?.lastRunAt ? new Date(agent.activity.lastRunAt).getTime() : 0;
}

export function AgentsNow({ agents }: { agents: AgentWithActivity[] }) {
  const sorted = [...agents].sort(
    (a, b) =>
      STATE_ORDER[getAgentState(a.activity)] - STATE_ORDER[getAgentState(b.activity)] ||
      lastRun(b) - lastRun(a),
  );
  const shown = sorted.slice(0, MAX_AGENTS);
  const working = agents.filter(
    (agent) => getAgentState(agent.activity) === "working",
  ).length;

  return (
    <section
      aria-labelledby="agents-now-title"
      className="rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-[18px] py-3">
        <div>
          <h2 id="agents-now-title" className="text-base font-semibold">
            Agents now
          </h2>
          <p className="text-[13px] text-fg-muted">
            {working > 0 ? `${working} working` : "All quiet"}
          </p>
        </div>
        <Link
          href="/agents"
          className="text-[13px] text-fg-muted transition-colors hover:text-fg"
        >
          View all
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="px-[18px] py-6 text-center text-[13px] text-fg-muted">
          No agents yet.{" "}
          <Link href="/agents/new" className="text-accent hover:underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {shown.map((agent) => (
            <li key={agent.id}>
              <Link
                href={`/agents/${agent.id}`}
                className="flex items-center gap-3 px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <AgentAvatar name={agent.name} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium">{agent.name}</span>
                  <AgentActivityInline activity={agent.activity} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
