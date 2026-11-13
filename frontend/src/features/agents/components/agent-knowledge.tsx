import Link from "next/link";
import { FileText } from "lucide-react";
import { ItemPicker } from "@/components/ui/item-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import { uploadedFileHref } from "@/features/files/entries";
import { formatBytes } from "@/lib/format";
import { attachDocuments, detachDocument } from "@/features/knowledge/actions";
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
          Documents this agent can read with the readDocument and
          searchDocuments tools. Remove only detaches a document from this
          agent; it stays in your library for other agents.
        </p>
      </div>

      {attached.length === 0 ? (
        <p className="px-[18px] py-4 text-[13px] text-fg-muted">
          No documents attached.
        </p>
      ) : (
        <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
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
              <Link
                href={uploadedFileHref(document.id)}
                className="min-w-0 flex-1 truncate text-[13px] hover:underline"
              >
                {document.name}
              </Link>
              <span className="font-mono text-xs text-fg-muted">
                {document.chunkCount} chunks
              </span>
              <form action={detachDocument.bind(null, agentId, document.id)}>
                <SubmitButton
                  variant="ghost"
                  pendingLabel="Removing…"
                  title="Detach from this agent. The document stays in your library."
                >
                  Remove
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-[18px] py-3">
        {available.length > 0 ? (
          <ItemPicker
            items={available.map((document) => ({
              id: document.id,
              label: document.name,
              meta: `${formatBytes(document.sizeBytes)} · ${document.chunkCount} chunks`,
            }))}
            action={attachDocuments.bind(null, agentId)}
            icon={
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            openLabel="Add documents"
            searchLabel="Search your library…"
            noun={{ one: "document", other: "documents" }}
          />
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
