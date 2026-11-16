import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
  const [summary, agents, activity, t, tAgents] = await Promise.all([
    apiFetch<DashboardSummary>("/dashboard"),
    apiFetch<Agent[]>("/agents"),
    apiFetch<AgentActivity[]>("/executions/activity"),
    getTranslations("dashboard"),
    getTranslations("agents"),
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
        title={t("title")}
        description={t("lead")}
        actions={
          <>
            <Link href="/executions" className={buttonClasses("secondary")}>
              {t("viewExecutions")}
            </Link>
            <Link href="/agents/new" className={buttonClasses("primary")}>
              {tAgents("new")}
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
          <StatCard label={t("stats.agents")} value={summary.agents} href="/agents" />
          <StatCard
            label={t("stats.tasksToday")}
            value={summary.tasksToday}
            href="/executions"
          />
          <StatCard
            label={t("stats.running")}
            value={summary.running}
            href="/executions?status=RUNNING"
            tone={summary.running > 0 ? "accent" : "default"}
          />
          <StatCard
            label={t("stats.waiting")}
            value={summary.waitingForApproval}
            href="/approvals"
            tone={summary.waitingForApproval > 0 ? "warning" : "default"}
          />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <ActivityChart days={summary.activity} />
            <UsageStats usage={summary.usage} quota={summary.quota} />
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
