import { AgentForm } from "@/components/agent-form";
import { PageHeader } from "@/components/page-header";
import { updateAgent } from "@/lib/agent-actions";
import { agentToFormValues } from "@/lib/agent-form";
import { getAgent } from "@/lib/agents";

export default async function EditAgentPage({ params }: PageProps<"/agents/[id]/edit">) {
  const { id } = await params;
  const agent = await getAgent(id);

  return (
    <div>
      <PageHeader
        title={`Edit ${agent.name}`}
        description="Update the agent's identity, model and instructions."
      />

      <div className="p-6">
        <AgentForm
          action={updateAgent.bind(null, agent.id)}
          initialValues={agentToFormValues(agent)}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          cancelHref={`/agents/${agent.id}`}
        />
      </div>
    </div>
  );
}
