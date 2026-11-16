import Link from "next/link";
import { Bot, Download, FileText, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteFile } from "@/features/files/actions";
import { fileAnchorId } from "@/features/files/entries";
import { deleteDocument } from "@/features/knowledge/actions";
import { useFormat } from "@/lib/format";
import type { FileEntry } from "@/features/files/types";

const ROW_GRID =
  "grid grid-cols-[1fr_72px] items-center gap-4 md:grid-cols-[1fr_110px_260px_72px]";

type FileListProps = {
  files: FileEntry[];
  highlightedId: string | null;
  emptyMessage: string;
};

function SourceBadge({ source }: { source: FileEntry["source"] }) {
  const t = useTranslations("files.source");

  if (source === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
        <Upload className="size-3" strokeWidth={2} aria-hidden />
        {t("uploaded")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
      <Bot className="size-3" strokeWidth={2} aria-hidden />
      {t("generated")}
    </span>
  );
}

function FileContext({ file }: { file: FileEntry }) {
  const t = useTranslations("files");

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
        ? t("knowledgeOf", { agents: file.agents.map((agent) => agent.name).join(", ") })
        : t("notAttached")}
    </p>
  );
}

function DeleteFileButton({ file }: { file: FileEntry }) {
  const t = useTranslations("files.delete");
  const usedBy = file.source === "uploaded" ? file.agents.length : 0;

  return (
    <ConfirmForm
      action={
        file.source === "uploaded"
          ? deleteDocument.bind(null, file.id)
          : deleteFile.bind(null, file.id)
      }
      title={t("title", { name: file.name })}
      message={
        file.source === "generated"
          ? t("generated")
          : usedBy > 0
            ? t("usedBy", { count: usedBy })
            : t("unused")
      }
      confirmLabel={file.source === "uploaded" ? t("document") : t("file")}
    >
      <SubmitButton
        variant="ghost"
        pendingLabel="…"
        aria-label={t("label", { name: file.name })}
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
  const t = useTranslations("files");
  const format = useFormat();

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
        <span>{t("columns.name")}</span>
        <span className="hidden md:block">{t("columns.source")}</span>
        <span className="hidden md:block">{t("columns.agent")}</span>
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
                  {format.bytes(file.sizeBytes)} ·{" "}
                  {format.executionDate(file.createdAt)}
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
                aria-label={t("download", { name: file.name })}
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
