"use client";

import { useActionState, useId } from "react";
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
          placeholder={hasOptions ? "Or write your own answer…" : "Your answer…"}
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
            pendingLabel="Skipping…"
            className="w-full"
            title="The agent continues without an answer and states its assumption."
          >
            Skip question
          </SubmitButton>
        </form>
        <Button
          type="submit"
          form={formId}
          variant="primary"
          disabled={pending}
          className="w-full"
        >
          {pending ? "Sending…" : "Send answer"}
        </Button>
      </div>
    </>
  );
}
