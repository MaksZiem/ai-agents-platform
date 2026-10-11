import Link from "next/link";
import { Check, Clock, Loader2, Minus, X, type LucideIcon } from "lucide-react";
import { formatDuration, getStepDurationMs } from "@/lib/format";
import { getStepTitle } from "@/lib/steps";
import type { ExecutionStep, StepStatus } from "@/lib/types";

const STEP_STATUS_CONFIG: Record<
  StepStatus,
  { label: string; icon: LucideIcon | null; circle: string; iconClass?: string }
> = {
  PENDING: { label: "Pending", icon: null, circle: "border-border" },
  RUNNING: {
    label: "Running",
    icon: Loader2,
    circle: "border-accent/40 bg-accent/10 text-accent",
    iconClass: "animate-spin motion-reduce:animate-none",
  },
  WAITING_FOR_APPROVAL: {
    label: "Waiting for approval",
    icon: Clock,
    circle: "border-warning/40 bg-warning/10 text-warning",
  },
  COMPLETED: {
    label: "Completed",
    icon: Check,
    circle: "border-success/40 bg-success/10 text-success",
  },
  FAILED: {
    label: "Failed",
    icon: X,
    circle: "border-danger/40 bg-danger/10 text-danger",
  },
  SKIPPED: {
    label: "Skipped",
    icon: Minus,
    circle: "border-border text-fg-subtle",
  },
};

function describeStep(step: ExecutionStep) {
  switch (step.status) {
    case "PENDING":
      return "Pending";
    case "RUNNING":
      return "Running…";
    case "WAITING_FOR_APPROVAL":
      return "Waiting for approval";
    case "FAILED":
      return step.error ?? "Failed";
    case "SKIPPED":
      return "Skipped";
    case "COMPLETED":
      if (step.type === "PLAN") return "Created execution plan";
      if (step.type === "FINAL_ANSWER") return "Produced final result";
      return "Completed";
  }
}

type StepRowProps = {
  step: ExecutionStep;
  isLast: boolean;
  isSelected: boolean;
};

function StepRow({ step, isLast, isSelected }: StepRowProps) {
  const {
    label,
    icon: Icon,
    circle,
    iconClass,
  } = STEP_STATUS_CONFIG[step.status];
  const durationMs = getStepDurationMs(step);

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
            {getStepTitle(step)}
          </p>
          <p className="text-[13px] text-fg-muted">{describeStep(step)}</p>
          {step.attempt > 1 && (
            <span className="mt-1 inline-block rounded bg-warning/10 px-1.5 text-[11px] text-warning">
              Attempt {step.attempt}
            </span>
          )}
        </div>

        <span className="font-mono text-xs text-fg-muted">
          {durationMs === null ? "—" : formatDuration(durationMs)}
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
  if (steps.length === 0) {
    return (
      <p className="py-8 text-center text-fg-muted">
        The agent is preparing a plan…
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
