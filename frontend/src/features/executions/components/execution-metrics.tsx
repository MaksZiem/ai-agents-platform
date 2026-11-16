import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/stat-card";
import { LiveDuration } from "@/features/executions/components/live-duration";
import type { ExecutionMetrics } from "@/features/executions/types";

type ExecutionMetricsRowProps = {
  metrics: ExecutionMetrics;
  startedAt: string | null;
  finishedAt: string | null;
  running: boolean;
};

export function ExecutionMetricsRow({
  metrics,
  startedAt,
  finishedAt,
  running,
}: ExecutionMetricsRowProps) {
  const t = useTranslations("executions.metrics");

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label={t("duration")}
        value={
          <LiveDuration
            startedAt={startedAt}
            finishedAt={finishedAt}
            running={running}
          />
        }
      />
      <StatCard label={t("llmCalls")} value={metrics.llmCalls} />
      <StatCard label={t("toolCalls")} value={metrics.toolCalls} />
      <StatCard
        label={t("retries")}
        value={metrics.retries}
        tone={metrics.retries > 0 ? "warning" : "default"}
      />
      <StatCard label={t("tokens")} value={metrics.totalTokens} />
    </section>
  );
}
