import Link from "next/link";
import { MessageCircleQuestionMark } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { answerQuestion } from "@/features/approvals/actions";
import { QuestionAnswerForm } from "@/features/approvals/components/question-answer-form";
import type { Approval } from "@/features/approvals/types";
import type { ExecutionWithAgent } from "@/features/executions/types";

type QuestionCardProps = {
  approval: Approval;
  execution?: ExecutionWithAgent;
};

function readQuestion(input: Record<string, unknown>) {
  const question = typeof input.question === "string" ? input.question : "";
  const options = Array.isArray(input.options)
    ? input.options.filter((option): option is string => typeof option === "string")
    : [];

  return { question, options };
}

export function QuestionCard({ approval, execution }: QuestionCardProps) {
  const titleId = `question-${approval.id}`;
  const { question, options } = readQuestion(approval.input);
  const answer = answerQuestion.bind(null, approval.id);

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-xl border border-accent/30 bg-surface p-[18px]"
    >
      <div className="flex flex-col gap-2">
        {execution && (
          <Link
            href={`/executions/${execution.id}`}
            className="truncate text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            {execution.agent.name} · {execution.task}
          </Link>
        )}
        <span className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <MessageCircleQuestionMark className="size-3.5" strokeWidth={2} aria-hidden />
          The agent has a question
        </span>
        <h2 id={titleId} className="whitespace-pre-wrap text-base font-semibold">
          {question}
        </h2>
        {approval.reason && (
          <p className="text-[13px] text-fg-muted">{approval.reason}</p>
        )}
      </div>

      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <form key={option} action={answer}>
              <input type="hidden" name="answer" value={option} />
              <SubmitButton pendingLabel="Sending…">{option}</SubmitButton>
            </form>
          ))}
        </div>
      )}

      <QuestionAnswerForm
        approvalId={approval.id}
        hasOptions={options.length > 0}
        labelledBy={titleId}
      />
    </section>
  );
}
