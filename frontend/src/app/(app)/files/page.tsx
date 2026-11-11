import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FileList } from "@/features/files/components/file-list";
import { FileSourceFilter } from "@/features/files/components/file-source-filter";
import { isFileSource, toFileEntries } from "@/features/files/entries";
import { apiFetch } from "@/lib/api";
import type { GeneratedFile } from "@/features/files/types";
import type { LibraryDocument } from "@/features/knowledge/types";

export const metadata: Metadata = {
  title: "Files",
};

const EMPTY_MESSAGES = {
  all: "No files yet. Upload a document in Knowledge or run an agent that creates a report.",
  uploaded: "You have not uploaded any files yet. Upload them in Knowledge.",
  generated: "No files yet. Reports created by agents will appear here.",
};

export default async function FilesPage({ searchParams }: PageProps<"/files">) {
  const { source, highlight } = await searchParams;
  const activeSource = isFileSource(source) ? source : null;

  const [documents, generated] = await Promise.all([
    apiFetch<LibraryDocument[]>("/knowledge"),
    apiFetch<GeneratedFile[]>("/files"),
  ]);
  const entries = toFileEntries(documents, generated);
  const visible = activeSource
    ? entries.filter((entry) => entry.source === activeSource)
    : entries;

  return (
    <div>
      <PageHeader
        title="Files"
        description="Files you uploaded as knowledge and files your agents created during executions."
      />

      <div className="flex max-w-6xl flex-col gap-4 p-6">
        <FileSourceFilter
          active={activeSource}
          counts={{
            all: entries.length,
            uploaded: documents.length,
            generated: generated.length,
          }}
        />
        <FileList
          files={visible}
          highlightedId={typeof highlight === "string" ? highlight : null}
          emptyMessage={EMPTY_MESSAGES[activeSource ?? "all"]}
        />
      </div>
    </div>
  );
}
