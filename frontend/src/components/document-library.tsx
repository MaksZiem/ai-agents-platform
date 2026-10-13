import { FileText, Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/confirm-form";
import { SubmitButton } from "@/components/submit-button";
import { formatBytes, formatShortDate } from "@/lib/format";
import { deleteDocument } from "@/lib/knowledge-actions";
import type { LibraryDocument } from "@/lib/types";

type DocumentLibraryProps = {
  documents: LibraryDocument[];
};

export function DocumentLibrary({ documents }: DocumentLibraryProps) {
  if (documents.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
        No documents yet. Upload one above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {documents.map((document) => (
        <li
          key={document.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 px-[18px] py-2.5 md:grid-cols-[1fr_220px_auto]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText
              className="size-4 shrink-0 text-fg-muted"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{document.name}</p>
              <p className="font-mono text-xs text-fg-muted">
                {formatBytes(document.sizeBytes)} · {document.chunkCount} chunks
                · {formatShortDate(document.createdAt)}
              </p>
            </div>
          </div>

          <p className="hidden truncate text-[13px] text-fg-muted md:block">
            {document.agents.length > 0
              ? document.agents.map((agent) => agent.name).join(", ")
              : "Not used by any agent"}
          </p>

          <ConfirmForm
            action={deleteDocument.bind(null, document.id)}
            message={`Delete "${document.name}"? Agents using it will lose access.`}
          >
            <SubmitButton
              variant="ghost"
              pendingLabel="Deleting…"
              aria-label={`Delete ${document.name}`}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </SubmitButton>
          </ConfirmForm>
        </li>
      ))}
    </ul>
  );
}
