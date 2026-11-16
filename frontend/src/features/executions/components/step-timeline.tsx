import Link from "next/link";
import { Check, Clock, Loader2, Minus, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStepTitle } from "@/features/executions/steps";
import { LiveDuration } from "@/features/executions/components/live-duration";
import type { ExecutionStep, StepStatus } from "@/features/executions/types";

const STEP_STATUS_CONFIG: Record<
  StepStatus,
  { icon: LucideIcon | null; circle: string; iconClass?: string }
> = {
  PENDING: { icon: null, circle: "border-border" },
  RUNNING: {
    icon: Loader2,
    circle: "border-accent/40 bg-accent/10 text-accent",
    iconClass: "animate-spin motion-reduce:animate-none",
  },
  WAITING_FOR_APPROVAL: {
    icon: Clock,
    circle: "border-warning/40 bg-warning/10 text-warning",
  },
  COMPLETED: {
    icon: Check,
    circle: "border-success/40 bg-success/10 text-success",
  },
  FAILED: {
    icon: X,
    circle: "border-danger/40 bg-danger/10 text-danger",
  },
  SKIPPED: {
    icon: Minus,
    circle: "border-border text-fg-subtle",
  },
};

function useDescribeStep() {
  const t = useTranslations("executions");

  return (step: ExecutionStep) => {
    switch (step.status) {
      case "RUNNING":
        return t("stepDescription.running");
      case "FAILED":
        return step.error ?? t("stepStatus.FAILED");
      case "COMPLETED":
        if (step.type === "PLAN") return t("stepDescription.planCreated");
        if (step.type === "FINAL_ANSWER") return t("stepDescription.finalProduced");
        return t("stepStatus.COMPLETED");
      default:
        return t(`stepStatus.${step.status}`);
    }
  };
}

type StepRowProps = {
  step: ExecutionStep;
  isLast: boolean;
  isSelected: boolean;
};

function StepRow({ step, isLast, isSelected }: StepRowProps) {
  const t = useTranslations("executions");
  const stepTitle = useStepTitle();
  const describeStep = useDescribeStep();
  const { icon: Icon, circle, iconClass } = STEP_STATUS_CONFIG[step.status];
  const label = t(`stepStatus.${step.status}`);
  return (
    <li className="relative">
      {!isLast && (
        <span
          className="absolute left-[19px] top-[34px] -bottom-2 w-px bg-border"
          aria-hidden
        />
      )}

      <Link
        href={`?step=${step.id}`}
        scroll={false}
        aria-current={isSelected ? "step" : undefined}
        className={`grid grid-cols-[22px_1fr_auto] gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent ${
          isSelected ? "bg-surface-hover" : ""
        } ${step.status === "PENDING" ? "opacity-50" : ""}`}
      >
        <span
          className={`flex size-[22px] items-center justify-center rounded-full border ${circle}`}
        >
          {Icon && (
            <Icon
              className={`size-3 ${iconClass ?? ""}`}
              strokeWidth={2.5}
              aria-hidden
            />
          )}
          <span className="sr-only">{label}</span>
        </span>

        <div className="min-w-0">
          <p className="font-mono text-[13px] font-medium">
            {stepTitle(step)}
          </p>
          <p className="text-[13px] text-fg-muted">{describeStep(step)}</p>
          {step.attempt > 1 && (
            <span className="mt-1 inline-block rounded bg-warning/10 px-1.5 text-[11px] text-warning">
              {t("attempt", { attempt: step.attempt })}
            </span>
          )}
        </div>

        <span className="font-mono text-xs text-fg-muted">
          <LiveDuration
            startedAt={step.startedAt}
            finishedAt={step.finishedAt}
            running={step.status === "RUNNING"}
          />
        </span>
      </Link>
    </li>
  );
}

type StepTimelineProps = {
  steps: ExecutionStep[];
  selectedStepId: string | null;
};

export function StepTimeline({ steps, selectedStepId }: StepTimelineProps) {
  const t = useTranslations("executions");

  if (steps.length === 0) {
    return (
      <p className="py-8 text-center text-fg-muted">
        {t("preparing")}
      </p>
    );
  }

  return (
    <ol>
      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          isLast={index === steps.length - 1}
          isSelected={step.id === selectedStepId}
        />
      ))}
    </ol>
  );
}
