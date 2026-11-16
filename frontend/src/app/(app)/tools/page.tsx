import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { ToolCatalog } from "@/features/tools/components/tool-catalog";
import { apiFetch } from "@/lib/api";
import type { Tool } from "@/features/tools/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools");
  return { title: t("title") };
}

export default async function ToolsPage() {
  const [tools, t] = await Promise.all([
    apiFetch<Tool[]>("/tools"),
    getTranslations("tools"),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} description={t("lead")} />
      <ToolCatalog tools={tools} />
    </div>
  );
}
