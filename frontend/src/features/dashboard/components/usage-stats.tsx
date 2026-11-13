import { StatCard } from "@/components/ui/stat-card";
import { formatDuration } from "@/lib/format";
import { DailyQuota } from "@/features/dashboard/components/daily-quota";
import type { UsageQuota, UsageSummary } from "@/features/dashboard/types";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function UsageStats({
  usage,
  quota,
}: {
  usage: UsageSummary;
  quota: UsageQuota;
}) {
  return (
    <section aria-labelledby="usage-title" className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="usage-title" className="text-base font-semibold">
          Usage
        </h2>
        <span className="text-[13px] text-fg-muted">Last 7 days</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label="Tokens"
          value={<span title={usage.tokens.toLocaleString("en-US")}>{formatCompact(usage.tokens)}</span>}
        />
        <StatCard
          label="Avg duration"
          value={usage.avgDurationMs === null ? "—" : formatDuration(usage.avgDurationMs)}
        />
        <StatCard label="LLM calls" value={usage.llmCalls} />
        <StatCard
          label="Retries"
          value={usage.retries}
          tone={usage.retries > 0 ? "warning" : "default"}
        />
      </div>
      <DailyQuota quota={quota} />
    </section>
  );
}
