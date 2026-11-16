import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ConnectionList } from "@/features/connections/components/connection-list";
import { apiFetch } from "@/lib/api";
import type { Connection } from "@/features/connections/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("connections");
  return { title: t("title") };
}

export default async function ConnectionsPage() {
  const [connections, t] = await Promise.all([
    apiFetch<Connection[]>("/connections"),
    getTranslations("connections"),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={
          <Link href="/connections/new" className={buttonClasses("primary")}>
            {t("new")}
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-4xl p-6">
        <ConnectionList connections={connections} />
      </div>
    </div>
  );
}
