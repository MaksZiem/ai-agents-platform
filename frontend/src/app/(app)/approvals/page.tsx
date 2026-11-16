import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { ApprovalCard } from "@/features/approvals/components/approval-card";
import { ApprovalHistory } from "@/features/approvals/components/approval-history";
import { apiFetch } from "@/lib/api";
import type { ApprovalWithExecution } from "@/features/approvals/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("approvals");
  return { title: t("title") };
}

export default async function ApprovalsPage() {
  const [approvals, t] = await Promise.all([
    apiFetch<ApprovalWithExecution[]>("/approvals"),
    getTranslations("approvals"),
  ]);
  const pending = approvals.filter((approval) => approval.status === "PENDING");
  const decided = approvals.filter((approval) => approval.status !== "PENDING");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="flex flex-col gap-8 p-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            {t("pending")} <span className="font-mono text-fg-muted">{pending.length}</span>
          </h2>
          {pending.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
              {t("nothingPending")}
            </p>
          ) : (
            <div className="grid items-start gap-4 lg:grid-cols-2">
              {pending.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  execution={approval.execution}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{t("history")}</h2>
          <ApprovalHistory approvals={decided} />
        </section>
      </div>
    </div>
  );
}
