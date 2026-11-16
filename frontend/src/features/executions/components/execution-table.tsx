import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteExecution } from "@/features/executions/actions";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import { ExecutionStatusBadge } from "@/features/executions/components/execution-status-badge";
import { isActiveStatus } from "@/features/executions/labels";
import { getDurationMs, useFormat } from "@/lib/format";
import type { ExecutionWithAgent } from "@/features/executions/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_200px_172px_80px_112px_34px]";

type ExecutionTableProps = {
  executions: ExecutionWithAgent[];
  emptyMessage: string;
};

export function ExecutionTable({ executions, emptyMessage }: ExecutionTableProps) {
  const t = useTranslations("executions");
  const format = useFormat();

  if (executions.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-fg-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>{t("columns.task")}</span>
        <span className="hidden md:block">{t("columns.agent")}</span>
        <span>{t("columns.status")}</span>
        <span className="hidden text-right md:block">{t("columns.duration")}</span>
        <span className="hidden text-right md:block">{t("columns.started")}</span>
        <span className="hidden md:block" />
      </div>

      <ul className="divide-y divide-border">
        {executions.map((execution) => {
          const durationMs = getDurationMs(execution);

          return (
            <li
              key={execution.id}
              className={`${ROW_GRID} relative px-[18px] py-2.5 transition-colors hover:bg-surface-hover`}
            >
              <div className="min-w-0">
                <Link
                  href={`/executions/${execution.id}`}
                  className="block truncate font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                >
                  {execution.task}
                </Link>
                <p className="truncate font-mono text-xs text-fg-muted">
                  <span className="md:hidden">{execution.agent.name} · </span>
                  {execution.model ?? "—"}
                </p>
              </div>
              <Link
                href={`/agents/${execution.agent.id}`}
                className="relative z-10 hidden min-w-0 items-center gap-2 rounded-md text-[13px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex"
              >
                <AgentAvatar name={execution.agent.name} />
                <span className="truncate">{execution.agent.name}</span>
              </Link>
              <div>
                <ExecutionStatusBadge status={execution.status} fixedWidth />
              </div>
              <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                {durationMs === null ? "—" : format.duration(durationMs)}
              </span>
              <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                {format.executionDate(execution.createdAt)}
              </span>
              <div className="relative z-10 hidden md:block">
                {!isActiveStatus(execution.status) && (
                  <ConfirmForm
                    action={deleteExecution.bind(null, execution.id, null)}
                    title={t("delete.title")}
                    message={t("delete.message")}
                    confirmLabel={t("delete.confirm")}
                  >
                    <SubmitButton
                      variant="ghost"
                      pendingLabel="…"
                      className="px-2"
                      aria-label={t("delete.label")}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                    </SubmitButton>
                  </ConfirmForm>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
