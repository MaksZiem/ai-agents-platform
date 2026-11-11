import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AgentGrid } from "@/features/agents/components/agent-grid";
import { AgentList, AgentsEmptyState } from "@/features/agents/components/agent-list";
import { AgentsLiveUpdates } from "@/features/agents/components/agents-live-updates";
import { AgentViewToggle } from "@/features/agents/components/agent-view-toggle";
import { getAgentState } from "@/features/agents/components/agent-activity";
import { apiFetch } from "@/lib/api";
import type { Agent, AgentActivity, AgentView } from "@/features/agents/types";

export const metadata: Metadata = {
  title: "Agents",
};

const STATE_ORDER = { working: 0, waiting: 1, idle: 2, new: 3 };

export default async function AgentsPage({ searchParams }: PageProps<"/agents">) {
  const { view: viewParam } = await searchParams;
  const view: AgentView = viewParam === "list" ? "list" : "grid";

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
            {agents.length > 0 && <AgentViewToggle active={view} />}
            <Link href="/agents/new" className={buttonClasses("primary")}>
              New agent
            </Link>
          </>
        }
      />

      <div className="p-6">
        {agents.length === 0 ? (
          <AgentsEmptyState />
        ) : view === "list" ? (
          <AgentList agents={withActivity} />
        ) : (
          <AgentGrid agents={withActivity} />
        )}
      </div>
    </div>
  );
}
