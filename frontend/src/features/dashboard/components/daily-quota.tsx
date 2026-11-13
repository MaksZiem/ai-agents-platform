import type { UsageQuota } from "@/features/dashboard/types";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function DailyQuota({ quota }: { quota: UsageQuota }) {
  const share = Math.min(1, quota.tokensToday / quota.dailyTokenLimit);
  const percent = Math.round(share * 100);
  const tone =
    share >= 1 ? "bg-danger" : share >= 0.8 ? "bg-warning" : "bg-accent";
  const textTone =
    share >= 1 ? "text-danger" : share >= 0.8 ? "text-warning" : "text-fg-muted";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-fg-muted">Tokens used today</span>
        <span className={`font-mono text-xs tabular-nums ${textTone}`}>
          {formatCompact(quota.tokensToday)} / {formatCompact(quota.dailyTokenLimit)} ·{" "}
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Daily token limit used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${share * 100}%` }} />
      </div>
      <p className="text-xs text-fg-muted">
        {share >= 1
          ? "Daily limit reached. New tasks start again after midnight."
          : `Each task can use up to ${formatCompact(quota.tokenBudgetPerExecution)} tokens; up to ${quota.maxConcurrentExecutions} tasks run at once.`}
      </p>
    </div>
  );
}
