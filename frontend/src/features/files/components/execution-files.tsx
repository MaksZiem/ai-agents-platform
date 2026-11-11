import { Download, FileText } from "lucide-react";
import { formatBytes } from "@/lib/format";
import type { GeneratedFile } from "@/features/files/types";

type ExecutionFilesProps = {
  files: GeneratedFile[];
};

export function ExecutionFiles({ files }: ExecutionFilesProps) {
  if (files.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-[18px]">
      <h2 className="mb-3 text-base font-semibold">
        Files <span className="font-mono text-fg-muted">{files.length}</span>
      </h2>
      <ul className="flex flex-col gap-1">
        {files.map((file) => (
          <li key={file.id}>
            <a
              href={`/api/files/${file.id}/download`}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-hover"
            >
              <FileText
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="font-mono text-xs text-fg-muted">
                {formatBytes(file.sizeBytes)}
              </span>
              <Download
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
