import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { approveApproval, rejectApproval } from "@/lib/execution-actions";
import { formatValue } from "@/lib/format";
import type { Approval } from "@/lib/types";

type ApprovalCardProps = {
  approval: Approval;
};

export function ApprovalCard({ approval }: ApprovalCardProps) {
  return (
    <section
      aria-labelledby="approval-title"
      className="flex flex-col gap-4 rounded-xl border border-warning/30 bg-surface p-[18px]"
    >
      <div className="flex flex-col gap-2">
        <StatusBadge status="WAITING_FOR_APPROVAL" />
        <h2 id="approval-title" className="text-base font-semibold">
          The agent wants to run{" "}
          <span className="font-mono">{approval.toolName}</span>
        </h2>
      </div>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-[13px]">
        {Object.entries(approval.input).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-fg-muted">{key}</dt>
            <dd className="break-words font-mono">{formatValue(value)}</dd>
          </div>
        ))}
        {approval.reason && (
          <div className="contents">
            <dt className="text-fg-muted">Reason</dt>
            <dd>{approval.reason}</dd>
          </div>
        )}
      </dl>

      <div className="grid grid-cols-2 gap-2">
        <form action={rejectApproval.bind(null, approval.id)}>
          <SubmitButton pendingLabel="Rejecting…" className="w-full">
            Reject
          </SubmitButton>
        </form>
        <form action={approveApproval.bind(null, approval.id)}>
          <SubmitButton variant="primary" pendingLabel="Approving…" className="w-full">
            Approve
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
