import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { duplicateAgent, setAgentStatus } from "@/features/agents/actions";
import { AgentConnections } from "@/features/agents/components/agent-connections";
import { AgentKnowledge } from "@/features/agents/components/agent-knowledge";
import { AgentPermissions } from "@/features/agents/components/agent-permissions";
import { AgentStatusBadge } from "@/features/agents/components/agent-status-badge";
import { AgentTools } from "@/features/agents/components/agent-tools";
import { DeleteAgentButton } from "@/features/agents/components/delete-agent-button";
import { getAgent } from "@/features/agents/queries";
import { runTask } from "@/features/executions/actions";
import { RecentExecutions } from "@/features/executions/components/recent-executions";
import { RunTaskForm } from "@/features/executions/components/run-task-form";
import { apiFetch } from "@/lib/api";
import { getFormat } from "@/lib/format-server";
import type { AgentTool, ResourcePermissions } from "@/features/agents/types";
import type { AgentConnection, Connection } from "@/features/connections/types";
import type { ExecutionWithAgent } from "@/features/executions/types";
import type { AgentDocument, KnowledgeDocument } from "@/features/knowledge/types";
import type { Tool } from "@/features/tools/types";

const CARD_CLASSES = "rounded-xl border border-border bg-surface p-[18px]";

export default async function AgentPage({ params }: PageProps<"/agents/[id]">) {
  const { id } = await params;
  const agent = await getAgent(id);
  const [t, format] = await Promise.all([getTranslations("agents.detail"), getFormat()]);
  const [
    executions,
    tools,
    agentTools,
    permissions,
    agentDocuments,
    library,
    agentConnections,
    connections,
  ] = await Promise.all([
    apiFetch<ExecutionWithAgent[]>(`/agents/${agent.id}/executions`),
    apiFetch<Tool[]>("/tools"),
    apiFetch<AgentTool[]>(`/agents/${agent.id}/tools`),
    apiFetch<ResourcePermissions[]>(`/agents/${agent.id}/permissions`),
    apiFetch<AgentDocument[]>(`/agents/${agent.id}/knowledge`),
    apiFetch<KnowledgeDocument[]>("/knowledge"),
    apiFetch<AgentConnection[]>(`/agents/${agent.id}/connections`),
    apiFetch<Connection[]>("/connections"),
  ]);

  const isActive = agent.status === "ACTIVE";

  return (
    <div>
      <PageHeader
        title={agent.name}
        description={agent.description ?? undefined}
        actions={
          <>
            <AgentStatusBadge status={agent.status} />
            <form
              action={setAgentStatus.bind(
                null,
                agent.id,
                isActive ? "INACTIVE" : "ACTIVE",
              )}
            >
              <SubmitButton
                pendingLabel={isActive ? t("deactivating") : t("activating")}
              >
                {isActive ? t("deactivate") : t("activate")}
              </SubmitButton>
            </form>
            <form action={duplicateAgent.bind(null, agent.id)}>
              <SubmitButton pendingLabel={t("duplicating")}>{t("duplicate")}</SubmitButton>
            </form>
            <Link
              href={`/agents/${agent.id}/edit`}
              className={buttonClasses("primary")}
            >
              {t("edit")}
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <RunTaskForm
            action={runTask.bind(null, agent.id)}
            agentName={agent.name}
            disabled={!isActive}
          />

          <section className={CARD_CLASSES}>
            <h2 className="mb-3 text-base font-semibold">{t("instructions")}</h2>
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-fg-muted">
              {agent.instructions}
            </pre>
          </section>

          <AgentTools
            agentId={agent.id}
            tools={tools}
            enabledTools={agentTools}
            permissions={permissions}
          />

          <AgentPermissions agentId={agent.id} permissions={permissions} />
          <AgentKnowledge
            agentId={agent.id}
            attached={agentDocuments}
            library={library}
          />
          <AgentConnections
            agentId={agent.id}
            attached={agentConnections}
            library={connections}
          />

          <RecentExecutions
            title={t("history")}
            executions={executions.slice(0, 10)}
          />
        </div>

        <aside className="flex flex-col gap-6">
          <section className={CARD_CLASSES}>
            <h2 className="mb-3 text-base font-semibold">{t("model")}</h2>
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[13px]">
              <dt className="text-fg-muted">{t("provider")}</dt>
              <dd>Google Gemini</dd>
              <dt className="text-fg-muted">{t("model")}</dt>
              <dd className="font-mono">{agent.model}</dd>
              <dt className="text-fg-muted">{t("temperature")}</dt>
              <dd className="font-mono">{agent.temperature}</dd>
              <dt className="text-fg-muted">{t("maxOutputTokens")}</dt>
              <dd className="font-mono">
                {format.number(agent.maxOutputTokens)}
              </dd>
              <dt className="text-fg-muted">{t("created")}</dt>
              <dd className="font-mono">{format.shortDate(agent.createdAt)}</dd>
            </dl>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-surface p-[18px]">
            <div>
              <h2 className="text-base font-semibold">{t("dangerZone")}</h2>
              <p className="text-[13px] text-fg-muted">{t("dangerBody")}</p>
            </div>
            <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
          </section>
        </aside>
      </div>
    </div>
  );
}
