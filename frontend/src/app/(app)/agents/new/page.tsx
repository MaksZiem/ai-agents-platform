import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { createAgent } from "@/features/agents/actions";
import { AgentForm } from "@/features/agents/components/agent-form";
import { EMPTY_AGENT_FORM } from "@/features/agents/form";

export const metadata: Metadata = {
  title: "New agent",
};

export default function NewAgentPage() {
  return (
    <div>
      <PageHeader
        title="New agent"
        description="Define who the agent is, which model it uses and how it should behave."
      />

      <div className="p-6">
        <AgentForm
          action={createAgent}
          initialValues={EMPTY_AGENT_FORM}
          submitLabel="Create agent"
          pendingLabel="Creating…"
          cancelHref="/agents"
        />
      </div>
    </div>
  );
}
