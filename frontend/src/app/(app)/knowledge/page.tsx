import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentLibrary } from "@/features/knowledge/components/document-library";
import { UploadDocumentForm } from "@/features/knowledge/components/upload-document-form";
import { apiFetch } from "@/lib/api";
import type { LibraryDocument } from "@/features/knowledge/types";

export const metadata: Metadata = {
  title: "Knowledge",
};

export default async function KnowledgePage() {
  const documents = await apiFetch<LibraryDocument[]>("/knowledge");

  return (
    <div>
      <PageHeader
        title="Knowledge"
        description="Documents your agents can search. Attach them to an agent on its page."
      />

      <div className="flex max-w-4xl flex-col gap-6 p-6">
        <UploadDocumentForm />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            Library{" "}
            <span className="font-mono text-fg-muted">{documents.length}</span>
          </h2>
          <DocumentLibrary documents={documents} />
        </section>
      </div>
    </div>
  );
}
