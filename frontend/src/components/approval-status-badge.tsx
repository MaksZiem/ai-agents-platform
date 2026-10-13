import type { ApprovalStatus } from "@/lib/types";

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  APPROVED: {
    label: "Approved",
    className: "border-success/30 bg-success/10 text-success",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-danger/30 bg-danger/10 text-danger",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-border bg-surface-2 text-fg-muted",
  },
};

type ApprovalStatusBadgeProps = {
  status: ApprovalStatus;
};

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const { label, className } = APPROVAL_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
