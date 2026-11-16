import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import type { UsageQuota } from "@/features/dashboard/types";

export function DailyQuota({ quota }: { quota: UsageQuota }) {
  const t = useTranslations("dashboard.quota");
  const format = useFormat();
  const share = Math.min(1, quota.tokensToday / quota.dailyTokenLimit);
  const percent = Math.round(share * 100);
  const tone =
    share >= 1 ? "bg-danger" : share >= 0.8 ? "bg-warning" : "bg-accent";
  const textTone =
    share >= 1 ? "text-danger" : share >= 0.8 ? "text-warning" : "text-fg-muted";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-fg-muted">{t("today")}</span>
        <span className={`font-mono text-xs tabular-nums ${textTone}`}>
          {format.compact(quota.tokensToday)} / {format.compact(quota.dailyTokenLimit)} ·{" "}
          {format.number(share, { style: "percent" })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t("progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${share * 100}%` }} />
      </div>
      <p className="text-xs text-fg-muted">
        {share >= 1
          ? t("reached")
          : t("info", {
              budget: format.compact(quota.tokenBudgetPerExecution),
              concurrent: quota.maxConcurrentExecutions,
            })}
      </p>
    </div>
  );
}
