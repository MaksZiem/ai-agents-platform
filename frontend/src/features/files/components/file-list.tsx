import Link from "next/link";
import { Bot, Download, FileText, Trash2, Upload } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteFile } from "@/features/files/actions";
import { fileAnchorId } from "@/features/files/entries";
import { deleteDocument } from "@/features/knowledge/actions";
import { formatBytes, formatExecutionDate } from "@/lib/format";
import type { FileEntry } from "@/features/files/types";

const ROW_GRID =
  "grid grid-cols-[1fr_72px] items-center gap-4 md:grid-cols-[1fr_110px_260px_72px]";

type FileListProps = {
  files: FileEntry[];
  highlightedId: string | null;
  emptyMessage: string;
};

function SourceBadge({ source }: { source: FileEntry["source"] }) {
  if (source === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
        <Upload className="size-3" strokeWidth={2} aria-hidden />
        Uploaded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
      <Bot className="size-3" strokeWidth={2} aria-hidden />
      Generated
    </span>
  );
}

function FileContext({ file }: { file: FileEntry }) {
  if (file.source === "generated") {
    return (
      <Link
        href={`/executions/${file.executionId}`}
        className="hidden min-w-0 text-[13px] text-fg-muted hover:text-fg md:block"
      >
        <span className="block truncate">{file.agent.name}</span>
        <span className="block truncate text-xs">{file.task}</span>
      </Link>
    );
  }

  return (
    <p className="hidden min-w-0 truncate text-[13px] text-fg-muted md:block">
      {file.agents.length > 0
        ? `Knowledge of ${file.agents.map((agent) => agent.name).join(", ")}`
        : "Not attached to any agent"}
    </p>
  );
}

function DeleteFileButton({ file }: { file: FileEntry }) {
  const usedBy = file.source === "uploaded" ? file.agents.length : 0;

  return (
    <ConfirmForm
      action={
        file.source === "uploaded"
          ? deleteDocument.bind(null, file.id)
          : deleteFile.bind(null, file.id)
      }
      title={`Delete "${file.name}"?`}
      message={
        file.source === "generated"
          ? "The file is removed permanently and can no longer be downloaded."
          : usedBy > 0
            ? `The document is removed from your library and from ${usedBy} ${usedBy === 1 ? "agent" : "agents"} that use it. To take it away from one agent only, use Remove on that agent's page. This cannot be undone.`
            : "The document is removed from your library. This cannot be undone."
      }
      confirmLabel={
        file.source === "uploaded" ? "Delete document" : "Delete file"
      }
    >
      <SubmitButton
        variant="ghost"
        pendingLabel="…"
        aria-label={`Delete ${file.name}`}
      >
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
      </SubmitButton>
    </ConfirmForm>
  );
}

export function FileList({
  files,
  highlightedId,
  emptyMessage,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>Name</span>
        <span className="hidden md:block">Source</span>
        <span className="hidden md:block">Agent</span>
        <span />
      </div>

      <ul className="divide-y divide-border">
        {files.map((file) => (
          <li
            key={`${file.source}-${file.id}`}
            id={fileAnchorId(file.id)}
            className={`${ROW_GRID} scroll-mt-6 px-[18px] py-2.5 last:rounded-b-xl ${
              file.id === highlightedId ? "bg-accent/10" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="font-mono text-xs text-fg-muted">
                  {formatBytes(file.sizeBytes)} ·{" "}
                  {formatExecutionDate(file.createdAt)}
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              <SourceBadge source={file.source} />
            </div>

            <FileContext file={file} />

            <div className="flex items-center justify-end gap-1">
              <a
                href={file.downloadHref}
                className={buttonClasses("ghost")}
                aria-label={`Download ${file.name}`}
              >
                <Download className="size-4" strokeWidth={1.75} aria-hidden />
              </a>
              <DeleteFileButton file={file} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
