import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { createConnection } from "@/features/connections/actions";
import { ConnectionForm } from "@/features/connections/components/connection-form";
import { EMPTY_CONNECTION_FORM } from "@/features/connections/form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("connections");
  return { title: t("new") };
}

export default async function NewConnectionPage() {
  const t = await getTranslations("connections");

  return (
    <div>
      <PageHeader
        title={t("new")}
        description={t("form.newLead")}
      />

      <div className="p-6">
        <ConnectionForm
          action={createConnection}
          initialValues={EMPTY_CONNECTION_FORM}
          secretStored={false}
          submitLabel={t("form.create")}
          pendingLabel={t("form.creating")}
        />
      </div>
    </div>
  );
}
