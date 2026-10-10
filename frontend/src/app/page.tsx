import Link from "next/link";
import { buttonClasses } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { RecentExecutions } from "@/components/recent-executions";
import { StatCard } from "@/components/stat-card";
import type {
  DashboardSummary,
  ExecutionStatus,
  ExecutionWithAgent,
} from "@/lib/types";

// TODO: zastąpić danymi z GET /dashboard, gdy frontend będzie miał logowanie
function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function mockExecution(
  id: string,
  agentName: string,
  task: string,
  status: ExecutionStatus,
  createdAt: string,
): ExecutionWithAgent {
  return {
    id,
    agentId: `agent-${id}`,
    task,
    status,
    result: null,
    error: null,
    model: "gemini-2.5-flash",
    llmCalls: 0,
    inputTokens: 0,
    outputTokens: 0,
    startedAt: createdAt,
    finishedAt: null,
    createdAt,
    updatedAt: createdAt,
    agent: { id: `agent-${id}`, name: agentName, icon: null },
  };
}

const summary: DashboardSummary = {
  agents: 5,
  tasksToday: 24,
  running: 2,
  waitingForApproval: 1,
  recentExecutions: [
    mockExecution("1", "Financial Analyst", "Analyze Q1 spending and compare it with Q4", "RUNNING", minutesAgo(3)),
    mockExecution("2", "Research Assistant", "Analyze competitors in the EU payments market", "WAITING_FOR_APPROVAL", minutesAgo(25)),
    mockExecution("3", "Sales Analyst", "Generate monthly sales report", "COMPLETED", minutesAgo(140)),
    mockExecution("4", "Financial Analyst", "Analyze February expenses", "FAILED", minutesAgo(380)),
    mockExecution("5", "Document Analyst", "Summarize the 2025 annual report", "COMPLETED", minutesAgo(60 * 26)),
  ],
};

export default function DashboardPage() {
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
