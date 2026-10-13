import type { Metadata } from "next";
import { ApprovalCard } from "@/components/approval-card";
import { ApprovalHistory } from "@/components/approval-history";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import type { ApprovalWithExecution } from "@/lib/types";

export const metadata: Metadata = {
  title: "Approvals",
};

export default async function ApprovalsPage() {
  const approvals = await apiFetch<ApprovalWithExecution[]>("/approvals");
  const pending = approvals.filter((approval) => approval.status === "PENDING");
  const decided = approvals.filter((approval) => approval.status !== "PENDING");

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Sensitive actions wait here until you approve or reject them."
      />

      <div className="flex flex-col gap-8 p-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            Pending <span className="font-mono text-fg-muted">{pending.length}</span>
          </h2>
          {pending.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
              Nothing is waiting for you.
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
          <h2 className="text-base font-semibold">History</h2>
          <ApprovalHistory approvals={decided} />
        </section>
      </div>
    </div>
  );
}
