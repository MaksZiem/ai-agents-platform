import Link from "next/link";
import { Download, FileText, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { uploadedFileHref } from "@/features/files/entries";
import { deleteDocument } from "@/features/knowledge/actions";
import { formatBytes, formatShortDate } from "@/lib/format";
import type { LibraryDocument } from "@/features/knowledge/types";

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
              <Link
                href={uploadedFileHref(document.id)}
                className="block truncate font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {document.name}
              </Link>
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

          <div className="flex items-center gap-1">
            <a
              href={`/api/knowledge/${document.id}/download`}
              className={buttonClasses("ghost")}
              aria-label={`Download ${document.name}`}
            >
              <Download className="size-4" strokeWidth={1.75} aria-hidden />
            </a>
            <ConfirmForm
              action={deleteDocument.bind(null, document.id)}
              title={`Delete "${document.name}"?`}
              message={
                document.agents.length > 0
                  ? `The document is removed from your library and from ${document.agents.length} ${document.agents.length === 1 ? "agent" : "agents"} that use it. To take it away from one agent only, use Remove on that agent's page. This cannot be undone.`
                  : "The document is removed from your library. This cannot be undone."
              }
              confirmLabel="Delete document"
            >
              <SubmitButton
                variant="ghost"
                pendingLabel="…"
                aria-label={`Delete ${document.name}`}
              >
                <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
              </SubmitButton>
            </ConfirmForm>
          </div>
        </li>
      ))}
    </ul>
  );
}
