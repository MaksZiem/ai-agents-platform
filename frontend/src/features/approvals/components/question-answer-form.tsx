"use client";

import { useActionState, useId } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import {
  rejectApproval,
  submitAnswer,
  type AnswerState,
} from "@/features/approvals/actions";

type QuestionAnswerFormProps = {
  approvalId: string;
  hasOptions: boolean;
  labelledBy: string;
};

const INITIAL_STATE: AnswerState = { error: null };

export function QuestionAnswerForm({
  approvalId,
  hasOptions,
  labelledBy,
}: QuestionAnswerFormProps) {
  const t = useTranslations("approvals.question");
  const formId = useId();
  const errorId = useId();
  const [state, formAction, pending] = useActionState(
    submitAnswer.bind(null, approvalId),
    INITIAL_STATE,
  );

  return (
    <>
      <form id={formId} action={formAction} noValidate className="flex flex-col gap-1.5">
        <Textarea
          name="answer"
          rows={3}
          maxLength={4000}
          placeholder={hasOptions ? t("ownAnswer") : t("yourAnswer")}
          aria-labelledby={labelledBy}
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? errorId : undefined}
        />
        {state.error && (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {state.error}
          </p>
        )}
      </form>

      <div className="grid grid-cols-2 gap-2">
        <form action={rejectApproval.bind(null, approvalId)}>
          <SubmitButton
            pendingLabel={t("skipping")}
            className="w-full"
            title={t("skipHint")}
          >
            {t("skip")}
          </SubmitButton>
        </form>
        <Button
          type="submit"
          form={formId}
          variant="primary"
          disabled={pending}
          className="w-full"
        >
          {pending ? t("sending") : t("send")}
        </Button>
      </div>
    </>
  );
}
