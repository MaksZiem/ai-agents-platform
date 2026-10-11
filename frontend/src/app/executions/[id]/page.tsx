import { notFound } from "next/navigation";
import { Button } from "@/components/button";
import { ExecutionMetricsRow } from "@/components/execution-metrics";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StepTimeline } from "@/components/step-timeline";
import { getMockExecution } from "@/lib/mock-data";
import type { ExecutionStatus } from "@/lib/types";

const ACTIVE_STATUSES: ExecutionStatus[] = [
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
];

export default async function ExecutionPage({
  params,
}: PageProps<"/executions/[id]">) {
  const { id } = await params;
  const execution = getMockExecution(id);

  if (!execution) notFound();

  const isActive = ACTIVE_STATUSES.includes(execution.status);

  return (
    <div>
      <PageHeader
        title={`${execution.agent.name} · ${execution.id.slice(0, 8)}`}
        description={execution.task}
        actions={
          <>
            <StatusBadge status={execution.status} />
            {isActive && <Button>Cancel</Button>}
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <ExecutionMetricsRow metrics={execution.metrics} />

        <section className="rounded-xl border border-border bg-surface px-[18px] py-3">
          <h2 className="pb-2 text-base font-semibold">Steps</h2>
          <StepTimeline steps={execution.steps} />
        </section>
      </div>
    </div>
  );
}
