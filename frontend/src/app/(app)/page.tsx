import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RecentExecutions } from "@/features/executions/components/recent-executions";
import { apiFetch } from "@/lib/api";
import type { DashboardSummary } from "@/features/dashboard/types";

export default async function DashboardPage() {
  const summary = await apiFetch<DashboardSummary>("/dashboard");

  return (
    <div>
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

        <RecentExecutions executions={summary.recentExecutions} />
      </div>
    </div>
  );
}
