import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AgentGrid } from "@/features/agents/components/agent-grid";
import { AgentList, AgentsEmptyState } from "@/features/agents/components/agent-list";
import { AgentSearch } from "@/features/agents/components/agent-search";
import { AgentsLiveUpdates } from "@/features/agents/components/agents-live-updates";
import { AgentViewToggle } from "@/features/agents/components/agent-view-toggle";
import { getAgentState } from "@/features/agents/components/agent-activity";
import { agentsHref, matchesAgentQuery } from "@/features/agents/search";
import { apiFetch } from "@/lib/api";
import type { Agent, AgentActivity, AgentView } from "@/features/agents/types";

export const metadata: Metadata = {
  title: "Agents",
};

const STATE_ORDER = { working: 0, waiting: 1, idle: 2, new: 3 };

export default async function AgentsPage({ searchParams }: PageProps<"/agents">) {
  const { view: viewParam, q } = await searchParams;
  const view: AgentView = viewParam === "list" ? "list" : "grid";
  const query = typeof q === "string" ? q.trim() : "";

  const [agents, activity] = await Promise.all([
    apiFetch<Agent[]>("/agents"),
    apiFetch<AgentActivity[]>("/executions/activity"),
  ]);
  const activityByAgent = new Map(activity.map((item) => [item.agentId, item]));
  const withActivity = agents
    .map((agent) => ({ ...agent, activity: activityByAgent.get(agent.id) ?? null }))
    .sort(
      (a, b) =>
        STATE_ORDER[getAgentState(a.activity)] - STATE_ORDER[getAgentState(b.activity)],
    );
  const visible = withActivity.filter((agent) => matchesAgentQuery(agent, query));
  const working = withActivity.filter(
    (agent) => getAgentState(agent.activity) === "working",
  ).length;

  return (
    <div>
      <AgentsLiveUpdates />
      <PageHeader
        title="Agents"
        description={
          working > 0
            ? `${working} of ${agents.length} ${agents.length === 1 ? "agent is" : "agents are"} working right now.`
            : "Agents you have configured and what they are allowed to do."
        }
        actions={
          <>
            {agents.length > 0 && <AgentViewToggle active={view} query={query} />}
            <Link href="/agents/new" className={buttonClasses("primary")}>
              New agent
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-4 p-6">
        {agents.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <AgentSearch query={query} view={view} />
            {query && (
              <p className="text-[13px] text-fg-muted" aria-live="polite">
                <span className="font-mono tabular-nums">{visible.length}</span> of{" "}
                <span className="font-mono tabular-nums">{agents.length}</span>{" "}
                {agents.length === 1 ? "agent" : "agents"}
              </p>
            )}
          </div>
        )}

        {agents.length === 0 ? (
          <AgentsEmptyState />
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <SearchX className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="text-sm">No agents match &ldquo;{query}&rdquo;</p>
              <p className="text-[13px] text-fg-muted">
                Search looks at agent names, descriptions and models.
              </p>
            </div>
            <Link href={agentsHref({ view })} className={buttonClasses("secondary")}>
              Clear search
            </Link>
          </div>
        ) : view === "list" ? (
          <AgentList agents={visible} />
        ) : (
          <AgentGrid agents={visible} />
        )}
      </div>
    </div>
  );
}
