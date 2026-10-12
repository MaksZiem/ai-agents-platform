import { notFound } from "next/navigation";
import { ApprovalCard } from "@/components/approval-card";
import { ExecutionLiveUpdates } from "@/components/execution-live-updates";
import { ExecutionMetricsRow } from "@/components/execution-metrics";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StepDetails } from "@/components/step-details";
import { StepTimeline } from "@/components/step-timeline";
import { SubmitButton } from "@/components/submit-button";
import { ApiError, apiFetch } from "@/lib/api";
import { cancelExecution } from "@/lib/execution-actions";
import { getAccessToken } from "@/lib/session";
import type {
  Approval,
  ExecutionDetail,
  ExecutionStatus,
  ExecutionStep,
} from "@/lib/types";

const ACTIVE_STATUSES: ExecutionStatus[] = [
  "QUEUED",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
];

async function getExecution(id: string) {
  try {
    return await apiFetch<ExecutionDetail>(`/executions/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}

async function getPendingApproval(executionId: string) {
  const approvals = await apiFetch<Approval[]>("/approvals?status=PENDING");
  return approvals.find((approval) => approval.executionId === executionId) ?? null;
}

function pickDefaultStep(steps: ExecutionStep[]) {
  return (
    steps.find(
      (step) =>
        step.status === "WAITING_FOR_APPROVAL" ||
        step.status === "RUNNING" ||
        step.status === "FAILED",
    ) ??
    steps.findLast((step) => step.status !== "PENDING") ??
    null
  );
}

export default async function ExecutionPage({
  params,
  searchParams,
}: PageProps<"/executions/[id]">) {
  const { id } = await params;
  const { step: stepParam } = await searchParams;

  const [execution, approval, token] = await Promise.all([
    getExecution(id),
    getPendingApproval(id),
    getAccessToken(),
  ]);

  const isActive = ACTIVE_STATUSES.includes(execution.status);
  const selectedStep =
    execution.steps.find((step) => step.id === stepParam) ??
    pickDefaultStep(execution.steps);

  return (
    <div>
      <PageHeader
        title={`${execution.agent.name} · ${execution.id.slice(0, 8)}`}
        description={execution.task}
        actions={
          <>
            {isActive && token && (
              <ExecutionLiveUpdates executionId={execution.id} token={token} />
            )}
            <StatusBadge status={execution.status} />
            {isActive && (
              <form action={cancelExecution.bind(null, execution.id)}>
                <SubmitButton pendingLabel="Cancelling…">Cancel</SubmitButton>
              </form>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <ExecutionMetricsRow metrics={execution.metrics} />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          <section className="rounded-xl border border-border bg-surface px-2.5 py-3">
            <h2 className="px-2 pb-2 text-base font-semibold">Steps</h2>
            <StepTimeline
              steps={execution.steps}
              selectedStepId={selectedStep?.id ?? null}
            />
          </section>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
            {approval && <ApprovalCard approval={approval} />}
            {selectedStep && <StepDetails step={selectedStep} />}
          </aside>
        </div>
      </div>
    </div>
  );
}
