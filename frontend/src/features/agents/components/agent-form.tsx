"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import {
  GEMINI_MODELS,
  type AgentFormState,
  type AgentFormValues,
} from "@/features/agents/form";

type AgentFormProps = {
  action: (state: AgentFormState, formData: FormData) => Promise<AgentFormState>;
  initialValues: AgentFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

const SECTION_CLASSES =
  "flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]";

export function AgentForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref,
}: AgentFormProps) {
  const [state, formAction] = useActionState(action, {
    values: initialValues,
    errors: {},
    formError: null,
  });
  const { values, errors } = state;

  return (
    <form action={formAction} className="flex max-w-[720px] flex-col gap-6">
      <section className={SECTION_CLASSES}>
        <h2 className="text-base font-semibold">Identity</h2>

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <FormField label="Name" error={errors.name}>
            <Input
              name="name"
              defaultValue={values.name}
              maxLength={100}
              placeholder="Financial Analyst"
              required
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>
          <FormField label="Icon" hint="One emoji" error={errors.icon}>
            <Input
              name="icon"
              defaultValue={values.icon}
              maxLength={32}
              placeholder="📊"
              aria-invalid={Boolean(errors.icon)}
            />
          </FormField>
        </div>

        <FormField label="Description" error={errors.description}>
          <Input
            name="description"
            defaultValue={values.description}
            maxLength={500}
            placeholder="Analyzes spending and prepares financial reports"
            aria-invalid={Boolean(errors.description)}
          />
        </FormField>
      </section>

      <section className={SECTION_CLASSES}>
        <div>
          <h2 className="text-base font-semibold">Model</h2>
          <p className="text-[13px] text-fg-muted">Provider: Google Gemini</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Model" error={errors.model}>
            <Select
              name="model"
              defaultValue={values.model}
              aria-invalid={Boolean(errors.model)}
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Temperature"
            hint="0 precise · 2 creative"
            error={errors.temperature}
          >
            <Input
              type="number"
              name="temperature"
              defaultValue={values.temperature}
              step="0.1"
              min="0"
              max="2"
              aria-invalid={Boolean(errors.temperature)}
            />
          </FormField>
          <FormField label="Max output tokens" error={errors.maxOutputTokens}>
            <Input
              type="number"
              name="maxOutputTokens"
              defaultValue={values.maxOutputTokens}
              step="1"
              min="1"
              max="65536"
              aria-invalid={Boolean(errors.maxOutputTokens)}
            />
          </FormField>
        </div>
      </section>

      <section className={SECTION_CLASSES}>
        <div>
          <h2 className="text-base font-semibold">Instructions</h2>
          <p className="text-[13px] text-fg-muted">
            The system instruction the agent follows on every task.
          </p>
        </div>

        <FormField label="System instruction" error={errors.instructions}>
          <Textarea
            name="instructions"
            defaultValue={values.instructions}
            rows={14}
            required
            placeholder={
              "You are a financial analyst.\n\nAnalyze financial data carefully.\nNever invent financial information."
            }
            className="min-h-80 font-mono text-[13px] leading-relaxed"
            aria-invalid={Boolean(errors.instructions)}
          />
        </FormField>
      </section>

      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger"
        >
          {state.formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className={buttonClasses("secondary")}>
          Cancel
        </Link>
        <SubmitButton variant="primary" pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
