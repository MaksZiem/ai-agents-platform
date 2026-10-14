import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AgentList } from "@/features/agents/components/agent-list";
import { apiFetch } from "@/lib/api";
import type { Agent } from "@/features/agents/types";

export const metadata: Metadata = {
  title: "Agents",
};

export default async function AgentsPage() {
  const agents = await apiFetch<Agent[]>("/agents");

  return (
    <div>
      <PageHeader
        title="Agents"
        description="Agents you have configured and what they are allowed to do."
        actions={
          <Link href="/agents/new" className={buttonClasses("primary")}>
            New agent
          </Link>
        }
      />

      <div className="p-6">
        <AgentList agents={agents} />
      </div>
    </div>
  );
}
