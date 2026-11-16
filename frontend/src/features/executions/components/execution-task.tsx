"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("executions.task");
  const [retrying, setRetrying] = useState(false);
  const retryIcon = <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />;

  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-[18px]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {t("title")}
          </h2>
          {canRetry && !retrying && (
            <Button onClick={() => setRetrying(true)}>
              {retryIcon}
              {t("retry")}
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
          title={t("retryTitle")}
          description={t("retryLead", { agent: agentName })}
          submitLabel={t("retry")}
          icon={retryIcon}
          onCancel={() => setRetrying(false)}
          autoFocus
        />
      )}
    </>
  );
}
