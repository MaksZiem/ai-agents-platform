import Link from "next/link";
import { Download, FileText, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteFile } from "@/features/files/actions";
import { formatBytes, formatExecutionDate } from "@/lib/format";
import type { GeneratedFile } from "@/features/files/types";

type FileListProps = {
  files: GeneratedFile[];
};

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-fg-muted">
        No files yet. Reports created by agents will appear here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {files.map((file) => (
        <li
          key={file.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 px-[18px] py-2.5 md:grid-cols-[1fr_260px_auto]"
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

          <Link
            href={`/executions/${file.executionId}`}
            className="hidden min-w-0 text-[13px] text-fg-muted hover:text-fg md:block"
          >
            <span className="block truncate">{file.execution.agent.name}</span>
            <span className="block truncate text-xs">
              {file.execution.task}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <a
              href={`/api/files/${file.id}/download`}
              className={buttonClasses("ghost")}
              aria-label={`Download ${file.name}`}
            >
              <Download className="size-4" strokeWidth={1.75} aria-hidden />
            </a>
            <ConfirmForm
              action={deleteFile.bind(null, file.id)}
              title={`Delete "${file.name}"?`}
              message="The file is removed permanently and can no longer be downloaded."
              confirmLabel="Delete file"
            >
              <SubmitButton
                variant="ghost"
                pendingLabel="Deleting…"
                aria-label={`Delete ${file.name}`}
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
