import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { AgentsLiveUpdates } from "@/features/agents/components/agents-live-updates";
import { ActivityChart } from "@/features/dashboard/components/activity-chart";
import { AgentsNow } from "@/features/dashboard/components/agents-now";
import { NeedsAttention } from "@/features/dashboard/components/needs-attention";
import { TopTools } from "@/features/dashboard/components/top-tools";
import { UsageStats } from "@/features/dashboard/components/usage-stats";
import { RecentExecutions } from "@/features/executions/components/recent-executions";
import { apiFetch } from "@/lib/api";
import type { Agent, AgentActivity } from "@/features/agents/types";
import type { DashboardSummary } from "@/features/dashboard/types";

export default async function DashboardPage() {
  const [summary, agents, activity] = await Promise.all([
    apiFetch<DashboardSummary>("/dashboard"),
    apiFetch<Agent[]>("/agents"),
    apiFetch<AgentActivity[]>("/executions/activity"),
  ]);
  const activityByAgent = new Map(activity.map((item) => [item.agentId, item]));
  const agentsWithActivity = agents.map((agent) => ({
    ...agent,
    activity: activityByAgent.get(agent.id) ?? null,
  }));

  return (
    <div>
      <AgentsLiveUpdates />
      <PageHeader
        title="Dashboard"
        description="Overview of your agents and executions."
        actions={
          <>
            <Link href="/executions" className={buttonClasses("secondary")}>
              View executions
            </Link>
            <Link href="/agents/new" className={buttonClasses("primary")}>
              New agent
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <NeedsAttention
          approvals={summary.attention.approvals}
          failures={summary.attention.failures}
        />

        <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <StatCard label="Agents" value={summary.agents} href="/agents" />
          <StatCard
            label="Tasks today"
            value={summary.tasksToday}
            href="/executions"
          />
          <StatCard
            label="Running"
            value={summary.running}
            href="/executions?status=RUNNING"
            tone={summary.running > 0 ? "accent" : "default"}
          />
          <StatCard
            label="Waiting for approval"
            value={summary.waitingForApproval}
            href="/approvals"
            tone={summary.waitingForApproval > 0 ? "warning" : "default"}
          />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <ActivityChart days={summary.activity} />
            <UsageStats usage={summary.usage} />
            <RecentExecutions executions={summary.recentExecutions} />
          </div>

          <aside className="flex flex-col gap-6">
            <AgentsNow agents={agentsWithActivity} />
            <TopTools tools={summary.topTools} />
          </aside>
        </div>
      </div>
    </div>
  );
}
