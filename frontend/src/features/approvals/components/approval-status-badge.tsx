import { useTranslations } from "next-intl";
import type { ApprovalStatus } from "@/features/approvals/types";

const APPROVAL_STATUS_CLASSES: Record<ApprovalStatus, string> = {
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  APPROVED: "border-success/30 bg-success/10 text-success",
  REJECTED: "border-danger/30 bg-danger/10 text-danger",
  CANCELLED: "border-border bg-surface-2 text-fg-muted",
};

type ApprovalStatusBadgeProps = {
  status: ApprovalStatus;
};

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const t = useTranslations("approvals.status");
  const className = APPROVAL_STATUS_CLASSES[status];

  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {t(status)}
    </span>
  );
}
