import { useTranslations } from "next-intl";
import { ToolCard } from "@/features/tools/components/tool-card";
import { ToolCategoryIcon } from "@/features/tools/components/tool-category-icon";
import { groupToolsByCategory, useToolLabels } from "@/features/tools/labels";
import type { Tool } from "@/features/tools/types";

export function ToolCatalog({ tools }: { tools: Tool[] }) {
  const t = useTranslations("tools");
  const labels = useToolLabels();
  const groups = groupToolsByCategory(tools);

  return (
    <div className="flex flex-col gap-8 p-6">
      <nav aria-label={t("categoriesLabel")} className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <a
            key={group.category}
            href={`#${group.category}`}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ToolCategoryIcon category={group.category} className="size-3.5" />
            {labels.category(group.category)}
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
              {labels.category(group.category)}
            </h2>
            <p className="text-[13px] text-fg-muted">
              {labels.categoryDescription(group.category)}
            </p>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {group.tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
