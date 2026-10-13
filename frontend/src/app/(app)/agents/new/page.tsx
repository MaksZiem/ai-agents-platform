import type { Metadata } from "next";
import { AgentForm } from "@/components/agent-form";
import { PageHeader } from "@/components/page-header";
import { createAgent } from "@/lib/agent-actions";
import { EMPTY_AGENT_FORM } from "@/lib/agent-form";

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
