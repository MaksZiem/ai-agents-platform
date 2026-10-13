"use client";

import { useActionState, type KeyboardEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/textarea";
import type { RunTaskState } from "@/lib/execution-actions";

type RunTaskFormProps = {
  action: (state: RunTaskState, formData: FormData) => Promise<RunTaskState>;
  agentName: string;
  disabled: boolean;
};

const INITIAL_STATE: RunTaskState = { error: null, task: "" };

function submitOnCmdEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function RunTaskForm({ action, agentName, disabled }: RunTaskFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);

  return (
    <section className="rounded-xl border border-border bg-surface p-[18px]">
      <form action={formAction}>
        <fieldset
          disabled={disabled}
          className="flex flex-col gap-3 disabled:opacity-60"
        >
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold">
              What would you like {agentName} to do?
            </span>
            <Textarea
              name="task"
              rows={4}
              maxLength={4000}
              required
              defaultValue={state.task}
              placeholder="Analyze our Q1 spending and compare it with Q4. Find unusual expenses and create a report."
              onKeyDown={submitOnCmdEnter}
              aria-invalid={Boolean(state.error)}
            />
          </label>

          {state.error && (
            <p role="alert" className="text-xs text-danger">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-fg-muted">
              {disabled
                ? "Activate this agent to run tasks."
                : "The agent plans the steps itself. ⌘ Enter to run."}
            </p>
            <SubmitButton variant="primary" pendingLabel="Starting…">
              Run agent
            </SubmitButton>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
