import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { updateAgent } from "@/features/agents/actions";
import { AgentForm } from "@/features/agents/components/agent-form";
import { agentToFormValues } from "@/features/agents/form";
import { getAgent } from "@/features/agents/queries";

export default async function EditAgentPage({ params }: PageProps<"/agents/[id]/edit">) {
  const { id } = await params;
  const [agent, t, tCommon] = await Promise.all([
    getAgent(id),
    getTranslations("agents.form"),
    getTranslations("common"),
  ]);

  return (
    <div>
      <PageHeader
        title={t("editTitle", { name: agent.name })}
        description={t("editLead")}
      />

      <div className="p-6">
        <AgentForm
          action={updateAgent.bind(null, agent.id)}
          initialValues={agentToFormValues(agent)}
          submitLabel={t("saveChanges")}
          pendingLabel={tCommon("saving")}
          cancelHref={`/agents/${agent.id}`}
        />
      </div>
    </div>
  );
}
