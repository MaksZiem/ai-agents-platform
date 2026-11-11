import Link from "next/link";
import { AgentAvatar } from "@/features/agents/components/agent-avatar";
import { formatShortDate } from "@/lib/format";
import type { ExecutionWithAgent } from "@/features/executions/types";

type ExecutionDetailsProps = {
  execution: ExecutionWithAgent;
};

export function ExecutionDetails({ execution }: ExecutionDetailsProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-[18px]">
      <h2 className="mb-3 text-base font-semibold">Details</h2>
      <dl className="grid grid-cols-[96px_1fr] items-center gap-x-3 gap-y-2 text-[13px]">
        <dt className="text-fg-muted">Agent</dt>
        <dd className="min-w-0">
          <Link
            href={`/agents/${execution.agent.id}`}
            className="inline-flex max-w-full items-center gap-2 rounded-md hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <AgentAvatar name={execution.agent.name} />
            <span className="truncate">{execution.agent.name}</span>
          </Link>
        </dd>
        <dt className="text-fg-muted">Provider</dt>
        <dd>Google Gemini</dd>
        <dt className="text-fg-muted">Model</dt>
        <dd className="font-mono">{execution.model ?? "—"}</dd>
        <dt className="text-fg-muted">Created</dt>
        <dd className="font-mono">{formatShortDate(execution.createdAt)}</dd>
      </dl>
    </section>
  );
}
