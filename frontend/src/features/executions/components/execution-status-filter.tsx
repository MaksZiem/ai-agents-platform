import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ExecutionStatus } from "@/features/executions/types";

const FILTERS: (ExecutionStatus | null)[] = [
  null,
  "RUNNING",
  "WAITING_FOR_APPROVAL",
  "QUEUED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

type ExecutionStatusFilterProps = {
  active: ExecutionStatus | null;
};

export function ExecutionStatusFilter({ active }: ExecutionStatusFilterProps) {
  const t = useTranslations("executions");

  return (
    <nav aria-label={t("filter.label")} className="flex flex-wrap gap-1">
      {FILTERS.map((status) => {
        const isActive = status === active;

        return (
          <Link
            key={status ?? "ALL"}
            href={status ? `/executions?status=${status}` : "/executions"}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {status ? t(`status.${status}`) : t("filter.all")}
          </Link>
        );
      })}
    </nav>
  );
}
