import Link from "next/link";
import { AgentPermissions } from "@/components/agent-permissions";
import { AgentStatusBadge } from "@/components/agent-status-badge";
import { AgentTools } from "@/components/agent-tools";
import { buttonClasses } from "@/components/button";
import { DeleteAgentButton } from "@/components/delete-agent-button";
import { PageHeader } from "@/components/page-header";
import { RecentExecutions } from "@/components/recent-executions";
import { SubmitButton } from "@/components/submit-button";
import { duplicateAgent, setAgentStatus } from "@/lib/agent-actions";
import { getAgent } from "@/lib/agents";
import { apiFetch } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import type {
  AgentTool,
  ExecutionWithAgent,
  ResourcePermissions,
  Tool,
} from "@/lib/types";

const CARD_CLASSES = "rounded-xl border border-border bg-surface p-[18px]";

export default async function AgentPage({ params }: PageProps<"/agents/[id]">) {
  const { id } = await params;
  const agent = await getAgent(id);
  const [executions, tools, agentTools, permissions] = await Promise.all([
    apiFetch<ExecutionWithAgent[]>(`/agents/${agent.id}/executions`),
    apiFetch<Tool[]>("/tools"),
    apiFetch<AgentTool[]>(`/agents/${agent.id}/tools`),
    apiFetch<ResourcePermissions[]>(`/agents/${agent.id}/permissions`),
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
            <form action={setAgentStatus.bind(null, agent.id, isActive ? "INACTIVE" : "ACTIVE")}>
              <SubmitButton pendingLabel={isActive ? "Deactivating…" : "Activating…"}>
                {isActive ? "Deactivate" : "Activate"}
              </SubmitButton>
            </form>
            <form action={duplicateAgent.bind(null, agent.id)}>
              <SubmitButton pendingLabel="Duplicating…">Duplicate</SubmitButton>
            </form>
            <Link href={`/agents/${agent.id}/edit`} className={buttonClasses("primary")}>
              Edit
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className={CARD_CLASSES}>
            <h2 className="mb-3 text-base font-semibold">Instructions</h2>
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-fg-muted">
              {agent.instructions}
            </pre>
          </section>

          <AgentTools agentId={agent.id} tools={tools} enabledTools={agentTools} />

          <AgentPermissions agentId={agent.id} permissions={permissions} />

          <RecentExecutions title="Execution history" executions={executions.slice(0, 10)} />
        </div>

        <aside className="flex flex-col gap-6">
          <section className={CARD_CLASSES}>
            <h2 className="mb-3 text-base font-semibold">Model</h2>
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[13px]">
              <dt className="text-fg-muted">Provider</dt>
              <dd>Google Gemini</dd>
              <dt className="text-fg-muted">Model</dt>
              <dd className="font-mono">{agent.model}</dd>
              <dt className="text-fg-muted">Temperature</dt>
              <dd className="font-mono">{agent.temperature}</dd>
              <dt className="text-fg-muted">Max output tokens</dt>
              <dd className="font-mono">{agent.maxOutputTokens.toLocaleString("en-US")}</dd>
              <dt className="text-fg-muted">Created</dt>
              <dd className="font-mono">{formatShortDate(agent.createdAt)}</dd>
            </dl>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-surface p-[18px]">
            <div>
              <h2 className="text-base font-semibold">Danger zone</h2>
              <p className="text-[13px] text-fg-muted">
                Deleting an agent removes its configuration and execution history.
              </p>
            </div>
            <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
          </section>
        </aside>
      </div>
    </div>
  );
}
