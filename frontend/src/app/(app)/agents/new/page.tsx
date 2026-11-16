import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { createAgent } from "@/features/agents/actions";
import { AgentForm } from "@/features/agents/components/agent-form";
import { EMPTY_AGENT_FORM } from "@/features/agents/form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agents.form");
  return { title: t("newTitle") };
}

export default async function NewAgentPage() {
  const t = await getTranslations("agents.form");

  return (
    <div>
      <PageHeader
        title={t("newTitle")}
        description={t("newLead")}
      />

      <div className="p-6">
        <AgentForm
          action={createAgent}
          initialValues={EMPTY_AGENT_FORM}
          submitLabel={t("create")}
          pendingLabel={t("creating")}
          cancelHref="/agents"
        />
      </div>
    </div>
  );
}
