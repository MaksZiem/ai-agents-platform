import { PageHeader } from "@/components/ui/page-header";
import { updateAgent } from "@/features/agents/actions";
import { AgentForm } from "@/features/agents/components/agent-form";
import { agentToFormValues } from "@/features/agents/form";
import { getAgent } from "@/features/agents/queries";

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
