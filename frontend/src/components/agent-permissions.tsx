import { SubmitButton } from "@/components/submit-button";
import { savePermissions } from "@/lib/agent-actions";
import { ACTION_LABELS, RESOURCE_LABELS } from "@/lib/tools";
import type { ResourcePermissions } from "@/lib/types";

type AgentPermissionsProps = {
  agentId: string;
  permissions: ResourcePermissions[];
};

export function AgentPermissions({ agentId, permissions }: AgentPermissionsProps) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">Permissions</h2>
        <p className="text-[13px] text-fg-muted">
          Enforced by the backend on every tool call, whatever the model decides.
        </p>
      </div>

      <form action={savePermissions.bind(null, agentId)}>
        <div className="divide-y divide-border">
          {permissions.map(({ resource, actions }) => (
            <div
              key={resource}
              role="group"
              aria-labelledby={`permissions-${resource}`}
              className="grid gap-2 px-[18px] py-3 sm:grid-cols-[160px_1fr] sm:items-center"
            >
              <span id={`permissions-${resource}`} className="text-[13px] font-medium">
                {RESOURCE_LABELS[resource]}
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {actions.map(({ action, granted }) => (
                  <label key={action} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      name="permission"
                      value={`${resource}:${action}`}
                      defaultChecked={granted}
                      className="size-4 accent-accent"
                    />
                    {ACTION_LABELS[action]}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border px-[18px] py-3">
          <SubmitButton variant="primary" pendingLabel="Saving…">
            Save permissions
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
