import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { FileList } from "@/features/files/components/file-list";
import { FileSourceFilter } from "@/features/files/components/file-source-filter";
import { isFileSource, toFileEntries } from "@/features/files/entries";
import { apiFetch } from "@/lib/api";
import type { GeneratedFile } from "@/features/files/types";
import type { LibraryDocument } from "@/features/knowledge/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("files");
  return { title: t("title") };
}

export default async function FilesPage({ searchParams }: PageProps<"/files">) {
  const { source, highlight } = await searchParams;
  const activeSource = isFileSource(source) ? source : null;

  const [documents, generated, t] = await Promise.all([
    apiFetch<LibraryDocument[]>("/knowledge"),
    apiFetch<GeneratedFile[]>("/files"),
    getTranslations("files"),
  ]);
  const entries = toFileEntries(documents, generated);
  const visible = activeSource
    ? entries.filter((entry) => entry.source === activeSource)
    : entries;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
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
          emptyMessage={t(`empty.${activeSource ?? "all"}`)}
        />
      </div>
    </div>
  );
}
