"use client";

import { SubmitButton } from "@/components/ui/submit-button";
import { deleteAgent } from "@/features/agents/actions";

type DeleteAgentButtonProps = {
  agentId: string;
  agentName: string;
};

export function DeleteAgentButton({ agentId, agentName }: DeleteAgentButtonProps) {
  return (
    <form
      action={deleteAgent.bind(null, agentId)}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete "${agentName}"? Its execution history will be deleted too.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete agent
      </SubmitButton>
    </form>
  );
}
