import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { ExecutionStatusFilter } from "@/features/executions/components/execution-status-filter";
import { ExecutionTable } from "@/features/executions/components/execution-table";
import { isExecutionStatus } from "@/features/executions/labels";
import { apiFetch } from "@/lib/api";
import type { ExecutionWithAgent } from "@/features/executions/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("executions");
  return { title: t("title") };
}

export default async function ExecutionsPage({ searchParams }: PageProps<"/executions">) {
  const { status } = await searchParams;
  const activeStatus = isExecutionStatus(status) ? status : null;

  const query = activeStatus ? `?status=${activeStatus}` : "";
  const [executions, t] = await Promise.all([
    apiFetch<ExecutionWithAgent[]>(`/executions${query}`),
    getTranslations("executions"),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="flex flex-col gap-4 p-6">
        <ExecutionStatusFilter active={activeStatus} />
        <ExecutionTable
          executions={executions}
          emptyMessage={
            activeStatus
              ? t("emptyStatus", { status: t(`status.${activeStatus}`) })
              : t("emptyAll")
          }
        />
      </div>
    </div>
  );
}
