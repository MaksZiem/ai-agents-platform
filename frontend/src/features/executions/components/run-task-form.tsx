"use client";

import { useActionState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { RunTaskState } from "@/features/executions/actions";

type RunTaskFormProps = {
  action: (state: RunTaskState, formData: FormData) => Promise<RunTaskState>;
  agentName: string;
  disabled: boolean;
  initialTask?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  icon?: ReactNode;
  onCancel?: () => void;
  autoFocus?: boolean;
};

function submitOnCmdEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function RunTaskForm({
  action,
  agentName,
  disabled,
  initialTask = "",
  title,
  description,
  submitLabel,
  icon,
  onCancel,
  autoFocus = false,
}: RunTaskFormProps) {
  const t = useTranslations("executions.run");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(action, {
    error: null,
    task: initialTask,
  });

  return (
    <section className="rounded-xl border border-border bg-surface p-[18px]">
      <form action={formAction} noValidate>
        <fieldset
          disabled={disabled}
          className="flex flex-col gap-3 disabled:opacity-60"
        >
          <label className="flex flex-col gap-2">
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{title ?? t("title", { agent: agentName })}</span>
              {description && (
                <span className="text-[13px] text-fg-muted">{description}</span>
              )}
            </span>
            <Textarea
              name="task"
              rows={4}
              maxLength={4000}
              defaultValue={state.task}
              placeholder={t("placeholder")}
              onKeyDown={submitOnCmdEnter}
              autoFocus={autoFocus}
              aria-invalid={Boolean(state.error)}
            />
          </label>

          {state.error && (
            <p role="alert" className="text-xs text-danger">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            {disabled && (
              <p className="mr-auto text-xs text-fg-muted">
                {t("inactive")}
              </p>
            )}
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                {tCommon("cancel")}
              </Button>
            )}
            <SubmitButton variant="primary" pendingLabel={t("starting")}>
              {icon}
              {submitLabel ?? t("submit")}
            </SubmitButton>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
