import Link from "next/link";
import { useTranslations } from "next-intl";
import { ApprovalStatusBadge } from "@/features/approvals/components/approval-status-badge";
import { useFormat } from "@/lib/format";
import type { ApprovalWithExecution } from "@/features/approvals/types";

type ApprovalHistoryProps = {
  approvals: ApprovalWithExecution[];
};

export function ApprovalHistory({ approvals }: ApprovalHistoryProps) {
  const t = useTranslations("approvals");
  const format = useFormat();

  if (approvals.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
        {t("noDecisions")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {approvals.map((approval) => (
        <li key={approval.id}>
          <Link
            href={`/executions/${approval.executionId}`}
            className="grid grid-cols-[1fr_auto] items-center gap-4 px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:grid-cols-[1fr_auto_112px]"
          >
            <div className="min-w-0">
              <p className="font-mono text-[13px] font-medium">{approval.toolName}</p>
              {approval.answer && (
                <p className="truncate text-[13px]">{t("answer", { answer: approval.answer })}</p>
              )}
              <p className="truncate text-[13px] text-fg-muted">
                {approval.execution.agent.name} · {approval.execution.task}
              </p>
            </div>
            <ApprovalStatusBadge status={approval.status} />
            <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
              {format.executionDate(approval.decidedAt ?? approval.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
