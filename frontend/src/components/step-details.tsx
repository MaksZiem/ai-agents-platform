import { JsonBlock } from "@/components/json-block";
import { formatDuration, getStepDurationMs } from "@/lib/format";
import { getStepTitle } from "@/lib/steps";
import type { ExecutionStep } from "@/lib/types";

type StepDetailsProps = {
  step: ExecutionStep;
};

export function StepDetails({ step }: StepDetailsProps) {
  const durationMs = getStepDurationMs(step);
  const hasData = step.input || step.output || step.error;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]">
      <div>
        <p className="text-xs text-fg-muted">Step {step.position}</p>
        <h2 className="font-mono text-base font-semibold">{getStepTitle(step)}</h2>
      </div>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-[13px]">
        <dt className="text-fg-muted">Duration</dt>
        <dd className="font-mono">
          {durationMs === null ? "—" : formatDuration(durationMs)}
        </dd>
        <dt className="text-fg-muted">Attempt</dt>
        <dd className="font-mono">{step.attempt}</dd>
      </dl>

      {step.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger">
          {step.error}
        </p>
      )}

      {step.input && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-fg-muted">Input</h3>
          <JsonBlock value={step.input} />
        </div>
      )}

      {step.output && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-fg-muted">Output</h3>
          <JsonBlock value={step.output} />
        </div>
      )}

      {!hasData && (
        <p className="text-[13px] text-fg-muted">
          No input or output recorded for this step.
        </p>
      )}
    </section>
  );
}
