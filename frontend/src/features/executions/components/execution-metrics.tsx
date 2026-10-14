import { StatCard } from "@/components/ui/stat-card";
import { formatDuration } from "@/lib/format";
import type { ExecutionMetrics } from "@/features/executions/types";

type ExecutionMetricsRowProps = {
  metrics: ExecutionMetrics;
};

export function ExecutionMetricsRow({ metrics }: ExecutionMetricsRowProps) {
  return (
    <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Duration"
        value={metrics.durationMs === null ? "—" : formatDuration(metrics.durationMs)}
      />
      <StatCard label="LLM calls" value={metrics.llmCalls} />
      <StatCard label="Tool calls" value={metrics.toolCalls} />
      <StatCard
        label="Retries"
        value={metrics.retries}
        tone={metrics.retries > 0 ? "warning" : "default"}
      />
      <StatCard label="Tokens" value={metrics.totalTokens} />
    </section>
  );
}
