import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ToolCard } from "@/features/tools/components/tool-card";
import { ToolCategoryIcon } from "@/features/tools/components/tool-category-icon";
import { groupToolsByCategory } from "@/features/tools/labels";
import { apiFetch } from "@/lib/api";
import type { Tool } from "@/features/tools/types";

export const metadata: Metadata = {
  title: "Tools",
};

export default async function ToolsPage() {
  const tools = await apiFetch<Tool[]>("/tools");
  const groups = groupToolsByCategory(tools);

  return (
    <div>
      <PageHeader
        title="Tools"
        description="Everything an agent can be allowed to do. Enable tools per agent on the agent's page; the backend checks the permission on every call."
      />

      <div className="flex flex-col gap-8 p-6">
        <nav aria-label="Tool categories" className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.category}
              href={`#${group.category}`}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ToolCategoryIcon category={group.category} className="size-3.5" />
              {group.label}
              <span className="font-mono text-xs tabular-nums">{group.tools.length}</span>
            </a>
          ))}
        </nav>

        {groups.map((group) => (
          <section
            key={group.category}
            id={group.category}
            aria-labelledby={`${group.category}-title`}
            className="flex scroll-mt-6 flex-col gap-3"
          >
            <div>
              <h2
                id={`${group.category}-title`}
                className="flex items-center gap-2 text-base font-semibold"
              >
                <ToolCategoryIcon category={group.category} />
                {group.label}
              </h2>
              <p className="text-[13px] text-fg-muted">{group.description}</p>
            </div>
            <div className="grid items-start gap-4 xl:grid-cols-2">
              {group.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
