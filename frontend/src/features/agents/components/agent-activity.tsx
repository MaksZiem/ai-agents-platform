import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatExecutionDate } from "@/lib/format";
import type { AgentActivity } from "@/features/agents/types";

type AgentState = "working" | "waiting" | "idle" | "new";

export function getAgentState(activity: AgentActivity | null): AgentState {
  if (activity?.current?.status === "WAITING_FOR_APPROVAL") return "waiting";
  if (activity?.current) return "working";
  if (activity && activity.totalRuns > 0) return "idle";
  return "new";
}

export function ThinkingDots() {
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1 rounded-full bg-current animate-thinking motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function PulseDot({ tone }: { tone: "accent" | "warning" }) {
  const color = tone === "accent" ? "bg-accent" : "bg-warning";

  return (
    <span className="relative flex size-2" aria-hidden>
      <span
        className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden ${color}`}
      />
      <span className={`relative inline-flex size-2 rounded-full ${color}`} />
    </span>
  );
}

export function AgentActivityInline({ activity }: { activity: AgentActivity | null }) {
  const state = getAgentState(activity);

  if (state === "working") {
    return (
      <span className="inline-flex min-w-0 items-center gap-2 text-[13px] text-accent">
        <PulseDot tone="accent" />
        <span className="truncate font-mono">
          {activity?.current?.step ?? "Starting"}
        </span>
        <ThinkingDots />
      </span>
    );
  }

  if (state === "waiting") {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-warning">
        <PulseDot tone="warning" />
        Needs approval
      </span>
    );
  }

  return (
    <span className="text-[13px] text-fg-muted">
      {state === "idle" && activity?.lastRunAt
        ? `Idle · ${formatExecutionDate(activity.lastRunAt)}`
        : "Never run"}
    </span>
  );
}

export function AgentActivityPanel({ activity }: { activity: AgentActivity | null }) {
  const state = getAgentState(activity);
  const current = activity?.current;

  if (current && state !== "idle") {
    const isWaiting = state === "waiting";

    return (
      <div
        className={`flex flex-col gap-1.5 rounded-lg border p-3 ${
          isWaiting
            ? "border-warning/30 bg-warning/10"
            : "border-accent/30 bg-accent/10"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[13px] font-medium ${
            isWaiting ? "text-warning" : "text-accent"
          }`}
        >
          <PulseDot tone={isWaiting ? "warning" : "accent"} />
          {isWaiting ? (
            "Waiting for your approval"
          ) : (
            <>
              <span className="font-mono">{current.step ?? "Starting"}</span>
              <ThinkingDots />
            </>
          )}
        </div>
        <p className="line-clamp-2 text-[13px] text-fg-muted">{current.task}</p>
        <Link
          href={`/executions/${current.executionId}`}
          className="relative z-10 inline-flex w-fit items-center gap-1 rounded-md text-xs font-medium text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isWaiting ? "Review" : "Watch live"}
          <ArrowRight className="size-3" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-[13px] text-fg-muted">
      <span className="size-2 rounded-full bg-fg-subtle" aria-hidden />
      {state === "idle" && activity?.lastRunAt
        ? `Idle · last run ${formatExecutionDate(activity.lastRunAt)}`
        : "Ready for its first task"}
    </div>
  );
}
