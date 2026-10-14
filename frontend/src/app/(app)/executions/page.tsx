import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ExecutionStatusFilter } from "@/features/executions/components/execution-status-filter";
import { ExecutionTable } from "@/features/executions/components/execution-table";
import { EXECUTION_STATUS_LABELS, isExecutionStatus } from "@/features/executions/labels";
import { apiFetch } from "@/lib/api";
import type { ExecutionWithAgent } from "@/features/executions/types";

export const metadata: Metadata = {
  title: "Executions",
};

export default async function ExecutionsPage({ searchParams }: PageProps<"/executions">) {
  const { status } = await searchParams;
  const activeStatus = isExecutionStatus(status) ? status : null;

  const query = activeStatus ? `?status=${activeStatus}` : "";
  const executions = await apiFetch<ExecutionWithAgent[]>(`/executions${query}`);

  return (
    <div>
      <PageHeader
        title="Executions"
        description="Every task your agents have run, newest first."
      />

      <div className="flex flex-col gap-4 p-6">
        <ExecutionStatusFilter active={activeStatus} />
        <ExecutionTable
          executions={executions}
          emptyMessage={
            activeStatus
              ? `No executions are ${EXECUTION_STATUS_LABELS[activeStatus].toLowerCase()}.`
              : "No executions yet. Run a task from one of your agents."
          }
        />
      </div>
    </div>
  );
}
