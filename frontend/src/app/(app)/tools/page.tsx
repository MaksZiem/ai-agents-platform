import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ToolCard } from "@/components/tool-card";
import { apiFetch } from "@/lib/api";
import { RESOURCE_LABELS } from "@/lib/tools";
import type { Tool, ToolResource } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tools",
};

export default async function ToolsPage() {
  const tools = await apiFetch<Tool[]>("/tools");

  const groups = (Object.keys(RESOURCE_LABELS) as ToolResource[])
    .map((resource) => ({
      resource,
      tools: tools.filter((tool) => tool.permission.resource === resource),
    }))
    .filter((group) => group.tools.length > 0);

  return (
    <div>
      <PageHeader
        title="Tools"
        description="Everything an agent can be allowed to do. Enable tools per agent on the agent's page."
      />

      <div className="flex flex-col gap-8 p-6">
        {groups.map(({ resource, tools: groupTools }) => (
          <section key={resource} className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{RESOURCE_LABELS[resource]}</h2>
            <div className="grid items-start gap-4 lg:grid-cols-2">
              {groupTools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
