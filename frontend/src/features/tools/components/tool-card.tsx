import { ChevronRight } from "lucide-react";
import { SchemaTable } from "@/features/tools/components/schema-table";
import { ACTION_LABELS, RESOURCE_LABELS } from "@/features/tools/labels";
import type { Tool } from "@/features/tools/types";

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[13px] font-semibold">{tool.name}</h3>
        <span className="rounded bg-surface-2 px-1.5 text-[11px] text-fg-muted">
          {RESOURCE_LABELS[tool.permission.resource]} ·{" "}
          {ACTION_LABELS[tool.permission.action]}
        </span>
        {tool.requiresApproval && (
          <span className="rounded bg-warning/10 px-1.5 text-[11px] text-warning">
            Always requires approval
          </span>
        )}
      </div>

      <p className="text-[13px] text-fg-muted">{tool.description}</p>

      <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none"
            strokeWidth={2}
            aria-hidden
          />
          Input and output schema
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <SchemaTable title="Input" schema={tool.inputSchema} />
          <SchemaTable title="Output" schema={tool.outputSchema} />
        </div>
      </details>
    </article>
  );
}
