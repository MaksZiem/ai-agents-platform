import Link from "next/link";
import { FileText } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { attachDocument, detachDocument } from "@/features/knowledge/actions";
import type { AgentDocument, KnowledgeDocument } from "@/features/knowledge/types";

type AgentKnowledgeProps = {
  agentId: string;
  attached: AgentDocument[];
  library: KnowledgeDocument[];
};

export function AgentKnowledge({
  agentId,
  attached,
  library,
}: AgentKnowledgeProps) {
  const attachedIds = new Set(attached.map((document) => document.id));
  const available = library.filter((document) => !attachedIds.has(document.id));

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">Knowledge</h2>
        <p className="text-[13px] text-fg-muted">
          Documents this agent can read with the searchDocuments tool.
        </p>
      </div>

      {attached.length === 0 ? (
        <p className="px-[18px] py-4 text-[13px] text-fg-muted">
          No documents attached.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {attached.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 px-[18px] py-2"
            >
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[13px]">
                {document.name}
              </span>
              <span className="font-mono text-xs text-fg-muted">
                {document.chunkCount} chunks
              </span>
              <form action={detachDocument.bind(null, agentId, document.id)}>
                <SubmitButton variant="ghost" pendingLabel="Removing…">
                  Remove
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-[18px] py-3">
        {available.length > 0 ? (
          <form
            action={attachDocument.bind(null, agentId)}
            className="flex gap-2"
          >
            <Select
              name="documentId"
              required
              defaultValue=""
              aria-label="Document to attach"
              className="min-w-0 flex-1"
            >
              <option value="" disabled>
                Choose a document…
              </option>
              {available.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.name}
                </option>
              ))}
            </Select>
            <SubmitButton pendingLabel="Attaching…">Attach</SubmitButton>
          </form>
        ) : (
          <p className="text-[13px] text-fg-muted">
            {library.length === 0 ? (
              <>
                Your library is empty.{" "}
                <Link href="/knowledge" className="text-accent hover:underline">
                  Upload a document
                </Link>
                .
              </>
            ) : (
              "Every document in your library is attached."
            )}
          </p>
        )}
      </div>
    </section>
  );
}
