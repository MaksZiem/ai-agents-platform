import Link from "next/link";
import type { ReactNode } from "react";
import { CircleX, MessageCircleQuestionMark, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  answerQuestion,
  approveApproval,
  rejectApproval,
} from "@/features/approvals/actions";
import { ASK_USER_TOOL } from "@/features/tools/types";
import { useFormat } from "@/lib/format";
import type { ApprovalWithExecution } from "@/features/approvals/types";
import type { ExecutionWithAgent } from "@/features/executions/types";

type NeedsAttentionProps = {
  approvals: ApprovalWithExecution[];
  failures: ExecutionWithAgent[];
};

const ROW_CLASSES =
  "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-[18px] py-3 md:grid-cols-[auto_1fr_auto]";
const ICON_CLASSES = "size-4 shrink-0";
const MAX_OPTIONS = 3;

function readQuestion(input: Record<string, unknown>) {
  const question = typeof input.question === "string" ? input.question : "";
  const options = Array.isArray(input.options)
    ? input.options.filter((option): option is string => typeof option === "string")
    : [];
  return { question, options };
}

function RowText({
  href,
  title,
  meta,
}: {
  href: string;
  title: ReactNode;
  meta: string;
}) {
  return (
    <Link href={href} className="group min-w-0">
      <p className="truncate text-[13px] group-hover:underline">{title}</p>
      <p className="truncate text-xs text-fg-muted">{meta}</p>
    </Link>
  );
}

function ApprovalRow({ approval }: { approval: ApprovalWithExecution }) {
  const t = useTranslations("dashboard.attention");
  const tCard = useTranslations("approvals.card");
  const { execution } = approval;
  const href = `/executions/${execution.id}`;
  const meta = `${execution.agent.name} · ${execution.task}`;

  if (approval.toolName === ASK_USER_TOOL) {
    const { question, options } = readQuestion(approval.input);

    return (
      <li className={ROW_CLASSES}>
        <MessageCircleQuestionMark
          className={`${ICON_CLASSES} text-accent`}
          strokeWidth={1.75}
          aria-label={t("question")}
        />
        <RowText href={href} title={question || t("hasQuestion")} meta={meta} />
        <div className="col-span-2 flex flex-wrap justify-end gap-2 md:col-span-1">
          {options.slice(0, MAX_OPTIONS).map((option) => (
            <form key={option} action={answerQuestion.bind(null, approval.id)}>
              <input type="hidden" name="answer" value={option} />
              <SubmitButton pendingLabel={t("sending")} className="max-w-[160px]">
                <span className="truncate">{option}</span>
              </SubmitButton>
            </form>
          ))}
          <Link href={href} className={buttonClasses("ghost")}>
            {t("answer")}
          </Link>
        </div>
      </li>
    );
  }

  return (
    <li className={ROW_CLASSES}>
      <ShieldAlert
        className={`${ICON_CLASSES} text-warning`}
        strokeWidth={1.75}
        aria-label={t("approvalRequired")}
      />
      <RowText
        href={href}
        title={
          <>
            {t.rich("run", {
              tool: approval.toolName,
              code: (chunks) => <span className="font-mono">{chunks}</span>,
            })}
            {approval.reason ? ` · ${approval.reason}` : ""}
          </>
        }
        meta={meta}
      />
      <div className="col-span-2 flex justify-end gap-2 md:col-span-1">
        <form action={rejectApproval.bind(null, approval.id)}>
          <SubmitButton pendingLabel={tCard("rejecting")}>{tCard("reject")}</SubmitButton>
        </form>
        <form action={approveApproval.bind(null, approval.id)}>
          <SubmitButton variant="primary" pendingLabel={tCard("approving")}>
            {tCard("approve")}
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}

function FailureRow({ execution }: { execution: ExecutionWithAgent }) {
  const t = useTranslations("dashboard.attention");
  const format = useFormat();
  const href = `/executions/${execution.id}`;

  return (
    <li className={ROW_CLASSES}>
      <CircleX
        className={`${ICON_CLASSES} text-danger`}
        strokeWidth={1.75}
        aria-label={t("failed")}
      />
      <RowText
        href={href}
        title={`${execution.agent.name} · ${execution.task}`}
        meta={`${t("failedAt", {
          date: format.executionDate(execution.finishedAt ?? execution.createdAt),
        })}${execution.error ? ` · ${execution.error}` : ""}`}
      />
      <div className="col-span-2 flex justify-end gap-2 md:col-span-1">
        <Link href={href} className={buttonClasses("secondary")}>
          {t("review")}
        </Link>
      </div>
    </li>
  );
}

export function NeedsAttention({ approvals, failures }: NeedsAttentionProps) {
  const t = useTranslations("dashboard.attention");
  const count = approvals.length + failures.length;
  if (count === 0) return null;

  return (
    <section
      aria-labelledby="attention-title"
      className="rounded-xl border border-warning/30 bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-border px-[18px] py-3">
        <h2 id="attention-title" className="text-base font-semibold">
          {t("title")}
        </h2>
        <span className="rounded-full bg-warning/10 px-1.5 font-mono text-[11px] text-warning tabular-nums">
          {count}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {approvals.map((approval) => (
          <ApprovalRow key={approval.id} approval={approval} />
        ))}
        {failures.map((execution) => (
          <FailureRow key={execution.id} execution={execution} />
        ))}
      </ul>
    </section>
  );
}
