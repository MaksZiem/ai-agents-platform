import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SubmitSwitch } from "@/components/ui/submit-switch";
import { disableTool, enableTool } from "@/features/agents/actions";
import { ToolCategoryIcon } from "@/features/tools/components/tool-category-icon";
import {
  alwaysPausesLabel,
  groupToolsByCategory,
  permissionLabel,
} from "@/features/tools/labels";
import type { AgentTool, ResourcePermissions } from "@/features/agents/types";
import type { Tool } from "@/features/tools/types";

type AgentToolsProps = {
  agentId: string;
  tools: Tool[];
  enabledTools: AgentTool[];
  permissions: ResourcePermissions[];
};

export function AgentTools({
  agentId,
  tools,
  enabledTools,
  permissions,
}: AgentToolsProps) {
  const enabledByName = new Map(enabledTools.map((tool) => [tool.toolName, tool]));
  const granted = new Set(
    permissions.flatMap(({ resource, actions }) =>
      actions
        .filter((action) => action.granted)
        .map(({ action }) => `${resource}:${action}`),
    ),
  );
  const groups = groupToolsByCategory(tools);

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-4 border-b border-border px-[18px] py-3">
        <div>
          <h2 className="text-base font-semibold">Tools</h2>
          <p className="text-[13px] text-fg-muted">
            The agent can only call the tools you enable here.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <span className="font-mono text-xs text-fg-muted tabular-nums">
            {enabledTools.length}/{tools.length} enabled
          </span>
          <Link
            href="/tools"
            className="flex items-center gap-1 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
          >
            All tools
            <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-border">
        {groups.map((group) => (
          <div key={group.category} className="pb-2">
            <h3 className="flex items-center gap-2 px-[18px] pt-3 pb-1 text-xs font-medium text-fg-muted">
              <ToolCategoryIcon category={group.category} className="size-3.5" />
              {group.label}
            </h3>

            <ul>
              {group.tools.map((tool) => {
                const enabled = enabledByName.get(tool.name);
                const missingPermission =
                  enabled && tool.permission
                    ? !granted.has(`${tool.permission.resource}:${tool.permission.action}`)
                    : false;

                return (
                  <li
                    key={tool.name}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-[18px] py-2"
                  >
                    <form
                      action={
                        enabled
                          ? disableTool.bind(null, agentId, tool.name)
                          : enableTool.bind(null, agentId, tool.name, false)
                      }
                    >
                      <SubmitSwitch
                        checked={Boolean(enabled)}
                        label={`Enable ${tool.name}`}
                      />
                    </form>

                    <div className="min-w-0">
                      <Link
                        href={`/tools#${tool.name}`}
                        className={`font-mono text-[13px] font-medium transition-colors hover:underline ${
                          enabled ? "text-fg" : "text-fg-muted"
                        }`}
                      >
                        {tool.name}
                      </Link>
                      <p className="truncate text-[13px] text-fg-muted" title={tool.summary}>
                        {tool.summary}
                      </p>
                      {missingPermission && tool.permission && (
                        <p className="mt-0.5 text-xs text-warning">
                          Needs {permissionLabel(tool.permission)} in Permissions below.
                        </p>
                      )}
                    </div>

                    {tool.requiresApproval ? (
                      <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[11px] whitespace-nowrap text-warning">
                        {alwaysPausesLabel(tool.name)}
                      </span>
                    ) : enabled ? (
                      <form
                        action={enableTool.bind(
                          null,
                          agentId,
                          tool.name,
                          !enabled.requiresApproval,
                        )}
                        className="flex items-center gap-2"
                      >
                        <span className="hidden text-xs text-fg-muted sm:inline">
                          Approval
                        </span>
                        <SubmitSwitch
                          checked={enabled.requiresApproval}
                          label={`Require approval for ${tool.name}`}
                        />
                      </form>
                    ) : (
                      <span aria-hidden />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
