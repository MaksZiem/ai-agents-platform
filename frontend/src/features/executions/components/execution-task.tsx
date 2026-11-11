"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RunTaskForm } from "@/features/executions/components/run-task-form";
import type { RunTaskState } from "@/features/executions/actions";

type ExecutionTaskProps = {
  task: string;
  agentName: string;
  canRetry: boolean;
  retryAction: (state: RunTaskState, formData: FormData) => Promise<RunTaskState>;
};

export function ExecutionTask({
  task,
  agentName,
  canRetry,
  retryAction,
}: ExecutionTaskProps) {
  const [retrying, setRetrying] = useState(false);
  const retryIcon = <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />;

  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-[18px]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Task
          </h2>
          {canRetry && !retrying && (
            <Button onClick={() => setRetrying(true)}>
              {retryIcon}
              Retry execution
            </Button>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {task}
        </p>
      </section>

      {canRetry && retrying && (
        <RunTaskForm
          action={retryAction}
          agentName={agentName}
          disabled={false}
          initialTask={task}
          title="Retry this execution"
          description={`Starts a new execution of ${agentName} with the task below and the agent's current configuration. Edit the task first if you want to change it. This execution stays in the history.`}
          submitLabel="Retry execution"
          icon={retryIcon}
          onCancel={() => setRetrying(false)}
          autoFocus
        />
      )}
    </>
  );
}
