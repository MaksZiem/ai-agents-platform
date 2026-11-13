import { notFound } from "next/navigation";
import { Square, Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { ApprovalCard } from "@/features/approvals/components/approval-card";
import {
  cancelExecution,
  deleteExecution,
  runTask,
} from "@/features/executions/actions";
import { ExecutionDetails } from "@/features/executions/components/execution-details";
import { ExecutionLiveUpdates } from "@/features/executions/components/execution-live-updates";
import { ExecutionTask } from "@/features/executions/components/execution-task";
import { ExecutionResult } from "@/features/executions/components/execution-result";
import { ExecutionMetricsRow } from "@/features/executions/components/execution-metrics";
import { ExecutionStatusBadge } from "@/features/executions/components/execution-status-badge";
import { StepDetails } from "@/features/executions/components/step-details";
import { StepTimeline } from "@/features/executions/components/step-timeline";
import { ExecutionFiles } from "@/features/files/components/execution-files";
import { ApiError, apiFetch } from "@/lib/api";
import type { Approval } from "@/features/approvals/types";
import type { GeneratedFile } from "@/features/files/types";
import { isActiveStatus } from "@/features/executions/labels";
import type { ExecutionDetail, ExecutionStep } from "@/features/executions/types";

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

  const execution = await getExecution(id);
  const [approval, files] = await Promise.all([
    getPendingApproval(id),
    apiFetch<GeneratedFile[]>(`/files?executionId=${execution.id}`),
  ]);

  const isActive = isActiveStatus(execution.status);
  const selectedStep =
    execution.steps.find((step) => step.id === stepParam) ??
    pickDefaultStep(execution.steps);

  return (
    <div>
      <PageHeader
        title={`${execution.agent.name} · ${execution.id.slice(0, 8)}`}
        actions={
          <>
            {isActive && <ExecutionLiveUpdates executionId={execution.id} />}
            <ExecutionStatusBadge status={execution.status} />
            {!isActive && (
              <ConfirmForm
                action={deleteExecution.bind(null, execution.id, "/executions")}
                title="Delete this execution?"
                message="Its steps, approvals and the files it created are deleted too. This cannot be undone."
                confirmLabel="Delete execution"
              >
                <SubmitButton variant="danger" pendingLabel="Deleting…">
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                  Delete
                </SubmitButton>
              </ConfirmForm>
            )}
            {isActive && (
              <ConfirmForm
                action={cancelExecution.bind(null, execution.id)}
                title="Stop this execution?"
                message="The agent stops immediately and no further steps will run."
                confirmLabel="Stop execution"
              >
                <SubmitButton variant="danger" pendingLabel="Stopping…">
                  <Square
                    className="size-3.5 fill-current"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Stop execution
                </SubmitButton>
              </ConfirmForm>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <ExecutionTask
          task={execution.task}
          agentName={execution.agent.name}
          canRetry={!isActive}
          retryAction={runTask.bind(null, execution.agentId)}
        />

        {execution.status === "FAILED" && execution.error && (
          <section
            role="alert"
            className="flex flex-col gap-1 rounded-xl border border-danger/30 bg-danger/10 p-[18px]"
          >
            <h2 className="text-base font-semibold text-danger">
              Execution failed
            </h2>
            <p className="whitespace-pre-wrap break-words font-mono text-[13px] text-danger">
              {execution.error}
            </p>
          </section>
        )}

        <ExecutionMetricsRow
          metrics={execution.metrics}
          startedAt={execution.startedAt}
          finishedAt={execution.finishedAt}
          running={isActive}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="rounded-xl border border-border bg-surface px-2.5 py-3">
              <h2 className="px-2 pb-2 text-base font-semibold">Steps</h2>
              <StepTimeline
                steps={execution.steps}
                selectedStepId={selectedStep?.id ?? null}
              />
            </section>
            <ExecutionResult execution={execution} />
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
            {approval && <ApprovalCard approval={approval} />}
            <ExecutionDetails execution={execution} />
            <ExecutionFiles files={files} />
            {selectedStep && <StepDetails step={selectedStep} />}
          </aside>
        </div>
      </div>
    </div>
  );
}
