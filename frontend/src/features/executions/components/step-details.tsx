import { useTranslations } from "next-intl";
import { JsonBlock } from "@/components/ui/json-block";
import { useStepTitle } from "@/features/executions/steps";
import { LiveDuration } from "@/features/executions/components/live-duration";
import type { ExecutionStep } from "@/features/executions/types";

type StepDetailsProps = {
  step: ExecutionStep;
};

export function StepDetails({ step }: StepDetailsProps) {
  const t = useTranslations("executions.stepDetails");
  const stepTitle = useStepTitle();
  const hasData = step.input || step.output || step.error;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]">
      <div>
        <p className="text-xs text-fg-muted">{t("step", { position: step.position })}</p>
        <h2 className="font-mono text-base font-semibold">{stepTitle(step)}</h2>
      </div>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-[13px]">
        <dt className="text-fg-muted">{t("duration")}</dt>
        <dd className="font-mono">
          <LiveDuration
            startedAt={step.startedAt}
            finishedAt={step.finishedAt}
            running={step.status === "RUNNING"}
          />
        </dd>
        <dt className="text-fg-muted">{t("attempt")}</dt>
        <dd className="font-mono">{step.attempt}</dd>
      </dl>

      {step.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger">
          {step.error}
        </p>
      )}

      {step.input && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-fg-muted">{t("input")}</h3>
          <JsonBlock value={step.input} />
        </div>
      )}

      {step.output && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-fg-muted">{t("output")}</h3>
          <JsonBlock value={step.output} />
        </div>
      )}

      {!hasData && (
        <p className="text-[13px] text-fg-muted">
          {t("noData")}
        </p>
      )}
    </section>
  );
}
