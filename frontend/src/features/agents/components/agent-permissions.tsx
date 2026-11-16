import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { savePermissions } from "@/features/agents/actions";
import type { ResourcePermissions } from "@/features/agents/types";

type AgentPermissionsProps = {
  agentId: string;
  permissions: ResourcePermissions[];
};

export function AgentPermissions({ agentId, permissions }: AgentPermissionsProps) {
  const t = useTranslations("permissions");
  const tTools = useTranslations("tools");
  const tCommon = useTranslations("common");

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-[13px] text-fg-muted">{t("lead")}</p>
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
                {tTools(`resources.${resource}`)}
              </span>
              <div className="grid grid-cols-3 gap-x-5 gap-y-2 sm:grid-cols-[repeat(3,112px)]">
                {actions.map(({ action, granted }) => (
                  <label key={action} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      name="permission"
                      value={`${resource}:${action}`}
                      defaultChecked={granted}
                      className="size-4 accent-accent"
                    />
                    {tTools(`actions.${action}`)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border px-[18px] py-3">
          <SubmitButton variant="primary" pendingLabel={tCommon("saving")}>
            {t("save")}
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
