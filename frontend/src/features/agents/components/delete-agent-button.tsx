"use client";

import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteAgent } from "@/features/agents/actions";

type DeleteAgentButtonProps = {
  agentId: string;
  agentName: string;
};

export function DeleteAgentButton({ agentId, agentName }: DeleteAgentButtonProps) {
  const t = useTranslations("agents.detail");

  return (
    <form
      action={deleteAgent.bind(null, agentId)}
      onSubmit={(event) => {
        const confirmed = window.confirm(t("deleteConfirm", { name: agentName }));
        if (!confirmed) event.preventDefault();
      }}
    >
      <SubmitButton variant="danger" pendingLabel={t("deleting")}>
        {t("delete")}
      </SubmitButton>
    </form>
  );
}
