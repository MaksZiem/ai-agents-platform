import Link from "next/link";
import { Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import { AgentStatusBadge } from "@/features/agents/components/agent-status-badge";
import {
  AgentActivityInline,
  getAgentState,
} from "@/features/agents/components/agent-activity";
import { useFormat } from "@/lib/format";
import type { AgentWithActivity } from "@/features/agents/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_170px_190px_96px_112px]";

export function AgentsEmptyState() {
  const t = useTranslations("agents");

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
      <Bot className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
      <div>
        <p className="text-sm">{t("empty.title")}</p>
        <p className="text-[13px] text-fg-muted">{t("empty.body")}</p>
      </div>
      <Link href="/agents/new" className={buttonClasses("primary")}>
        {t("new")}
      </Link>
    </div>
  );
}

export function AgentList({ agents }: { agents: AgentWithActivity[] }) {
  const t = useTranslations("agents.columns");
  const format = useFormat();

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>{t("agent")}</span>
        <span className="hidden md:block">{t("model")}</span>
        <span className="hidden md:block">{t("activity")}</span>
        <span>{t("status")}</span>
        <span className="hidden text-right md:block">{t("created")}</span>
      </div>

      <ul className="divide-y divide-border">
        {agents.map((agent) => {
          const state = getAgentState(agent.activity);

          return (
            <li key={agent.id} className="relative">
              {(state === "working" || state === "waiting") && (
                <span
                  className={`absolute inset-y-0 left-0 w-0.5 animate-pulse motion-reduce:animate-none ${
                    state === "working" ? "bg-accent" : "bg-warning"
                  }`}
                  aria-hidden
                />
              )}
              <Link
                href={`/agents/${agent.id}`}
                className={`${ROW_GRID} px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                  agent.status === "INACTIVE" ? "opacity-60" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AgentAvatar name={agent.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{agent.name}</p>
                    {agent.description && (
                      <p className="truncate text-[13px] text-fg-muted">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="hidden truncate font-mono text-[13px] text-fg-muted md:block">
                  {agent.model}
                </span>
                <span className="hidden min-w-0 md:flex">
                  <AgentActivityInline activity={agent.activity} />
                </span>
                <AgentStatusBadge status={agent.status} />
                <span className="hidden text-right font-mono text-xs text-fg-muted md:block">
                  {format.shortDate(agent.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
