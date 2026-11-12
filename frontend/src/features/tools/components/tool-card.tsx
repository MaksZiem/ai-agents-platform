import { ChevronRight } from "lucide-react";
import { SchemaTable } from "@/features/tools/components/schema-table";
import { alwaysPausesLabel, permissionLabel } from "@/features/tools/labels";
import { getSchemaFields } from "@/features/tools/schema";
import type { Tool } from "@/features/tools/types";

type ToolCardProps = {
  tool: Tool;
};

const CHIP_CLASSES =
  "rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]";

export function ToolCard({ tool }: ToolCardProps) {
  const inputFields = getSchemaFields(tool.inputSchema);

  return (
    <article
      id={tool.name}
      className="flex scroll-mt-6 flex-col rounded-xl border border-border bg-surface transition-colors target:border-accent/60"
    >
      <div className="flex flex-col gap-1 px-[18px] pt-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold">{tool.name}</h3>
          {tool.requiresApproval && (
            <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[11px] text-warning">
              {alwaysPausesLabel(tool.name)}
            </span>
          )}
        </div>
        <p className="text-sm">{tool.summary}</p>
      </div>

      <p className="px-[18px] pt-2 pb-4 text-[13px] leading-relaxed text-fg-muted">
        {tool.description}
      </p>

      <dl className="mt-auto grid grid-cols-[84px_1fr] items-baseline gap-x-3 gap-y-2.5 border-t border-border px-[18px] py-3 text-[13px]">
        <dt className="text-xs font-medium text-fg-muted">Permission</dt>
        <dd>
          {tool.permission ? (
            <span className={CHIP_CLASSES}>
              {tool.permission.resource}:{tool.permission.action}
            </span>
          ) : (
            <span className="text-fg-muted">None needed</span>
          )}
          {tool.permission && (
            <span className="ml-2 text-xs text-fg-muted">
              {permissionLabel(tool.permission)}
            </span>
          )}
        </dd>

        <dt className="text-xs font-medium text-fg-muted">Approval</dt>
        <dd className="text-fg-muted">
          {tool.requiresApproval ? "Always, for every call" : "Optional, set per agent"}
        </dd>

        <dt className="text-xs font-medium text-fg-muted">Input</dt>
        <dd className="flex flex-wrap gap-1">
          {inputFields.length === 0 ? (
            <span className="text-fg-muted">No fields</span>
          ) : (
            inputFields.map((field) => (
              <span key={field.name} className={CHIP_CLASSES} title={field.type}>
                {field.name}
                <span className="text-fg-muted">
                  {field.required ? "" : "?"}: {field.type}
                </span>
              </span>
            ))
          )}
        </dd>
      </dl>

      <details className="group border-t border-border px-[18px] py-3">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none"
            strokeWidth={2}
            aria-hidden
          />
          Output fields
        </summary>
        <div className="mt-3">
          <SchemaTable schema={tool.outputSchema} />
        </div>
      </details>
    </article>
  );
}
