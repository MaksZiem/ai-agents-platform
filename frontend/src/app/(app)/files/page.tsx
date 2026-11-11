import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FileList } from "@/features/files/components/file-list";
import { apiFetch } from "@/lib/api";
import type { GeneratedFile } from "@/features/files/types";

export const metadata: Metadata = {
  title: "Files",
};

export default async function FilesPage() {
  const files = await apiFetch<GeneratedFile[]>("/files");

  return (
    <div>
      <PageHeader
        title="Files"
        description="Reports and other files your agents created during executions."
      />

      <div className="flex max-w-5xl flex-col gap-3 p-6">
        <h2 className="text-base font-semibold">
          All files{" "}
          <span className="font-mono text-fg-muted">{files.length}</span>
        </h2>
        <FileList files={files} />
      </div>
    </div>
  );
}
