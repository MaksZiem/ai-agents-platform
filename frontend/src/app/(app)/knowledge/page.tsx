import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentLibrary } from "@/features/knowledge/components/document-library";
import { UploadDocumentForm } from "@/features/knowledge/components/upload-document-form";
import { apiFetch } from "@/lib/api";
import type { LibraryDocument } from "@/features/knowledge/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("knowledge");
  return { title: t("title") };
}

export default async function KnowledgePage() {
  const [documents, t] = await Promise.all([
    apiFetch<LibraryDocument[]>("/knowledge"),
    getTranslations("knowledge"),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
        <UploadDocumentForm />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            {t("library")}{" "}
            <span className="font-mono text-fg-muted">{documents.length}</span>
          </h2>
          <DocumentLibrary documents={documents} />
        </section>
      </div>
    </div>
  );
}
