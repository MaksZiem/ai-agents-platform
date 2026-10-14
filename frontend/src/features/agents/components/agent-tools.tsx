import { SubmitSwitch } from "@/components/ui/submit-switch";
import { disableTool, enableTool } from "@/features/agents/actions";
import { RESOURCE_LABELS } from "@/features/tools/labels";
import type { AgentTool } from "@/features/agents/types";
import type { Tool } from "@/features/tools/types";

type AgentToolsProps = {
  agentId: string;
  tools: Tool[];
  enabledTools: AgentTool[];
};

export function AgentTools({ agentId, tools, enabledTools }: AgentToolsProps) {
  const enabledByName = new Map(enabledTools.map((tool) => [tool.toolName, tool]));

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">Tools</h2>
        <p className="text-[13px] text-fg-muted">
          The agent can only call the tools you enable here.
        </p>
      </div>

      <ul className="divide-y divide-border">
        {tools.map((tool) => {
          const enabled = enabledByName.get(tool.name);

          return (
            <li key={tool.name} className="flex items-start gap-3 px-[18px] py-3">
              <form
                action={
                  enabled
                    ? disableTool.bind(null, agentId, tool.name)
                    : enableTool.bind(null, agentId, tool.name, false)
                }
                className="pt-0.5"
              >
                <SubmitSwitch checked={Boolean(enabled)} label={`Enable ${tool.name}`} />
              </form>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[13px] font-medium">{tool.name}</span>
                  <span className="rounded bg-surface-2 px-1.5 text-[11px] text-fg-muted">
                    {RESOURCE_LABELS[tool.permission.resource]} · {tool.permission.action}
                  </span>
                </div>
                <p className="text-[13px] text-fg-muted">{tool.description}</p>
              </div>

              {tool.requiresApproval ? (
                <span className="shrink-0 rounded bg-warning/10 px-1.5 text-[11px] text-warning">
                  Always requires approval
                </span>
              ) : (
                enabled && (
                  <form
                    action={enableTool.bind(null, agentId, tool.name, !enabled.requiresApproval)}
                    className="flex shrink-0 items-center gap-2"
                  >
                    <span className="text-xs text-fg-muted">Require approval</span>
                    <SubmitSwitch
                      checked={enabled.requiresApproval}
                      label={`Require approval for ${tool.name}`}
                    />
                  </form>
                )
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
