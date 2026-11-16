import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/stat-card";
import { useFormat } from "@/lib/format";
import { DailyQuota } from "@/features/dashboard/components/daily-quota";
import type { UsageQuota, UsageSummary } from "@/features/dashboard/types";

export function UsageStats({
  usage,
  quota,
}: {
  usage: UsageSummary;
  quota: UsageQuota;
}) {
  const t = useTranslations("dashboard.usage");
  const format = useFormat();

  return (
    <section aria-labelledby="usage-title" className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="usage-title" className="text-base font-semibold">
          {t("title")}
        </h2>
        <span className="text-[13px] text-fg-muted">{t("period")}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label={t("tokens")}
          value={<span title={format.number(usage.tokens)}>{format.compact(usage.tokens)}</span>}
        />
        <StatCard
          label={t("avgDuration")}
          value={usage.avgDurationMs === null ? "—" : format.duration(usage.avgDurationMs)}
        />
        <StatCard label={t("llmCalls")} value={usage.llmCalls} />
        <StatCard
          label={t("retries")}
          value={usage.retries}
          tone={usage.retries > 0 ? "warning" : "default"}
        />
      </div>
      <DailyQuota quota={quota} />
    </section>
  );
}
