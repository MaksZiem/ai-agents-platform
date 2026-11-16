import { getTranslations } from "next-intl/server";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  deleteConnection,
  updateConnection,
} from "@/features/connections/actions";
import { ConnectionForm } from "@/features/connections/components/connection-form";
import { connectionToFormValues } from "@/features/connections/form";
import { getConnection } from "@/features/connections/queries";

export default async function ConnectionPage({
  params,
}: PageProps<"/connections/[id]">) {
  const { id } = await params;
  const [connection, t, tCommon] = await Promise.all([
    getConnection(id),
    getTranslations("connections"),
    getTranslations("common"),
  ]);

  return (
    <div>
      <PageHeader
        title={connection.name}
        description={connection.baseUrl}
        actions={
          <ConfirmForm
            action={deleteConnection.bind(null, connection.id)}
            title={t("delete.title", { name: connection.name })}
            message={t("delete.message")}
            confirmLabel={t("delete.confirm")}
          >
            <SubmitButton pendingLabel={t("delete.pending")}>{t("delete.button")}</SubmitButton>
          </ConfirmForm>
        }
      />

      <div className="p-6">
        <ConnectionForm
          action={updateConnection.bind(
            null,
            connection.id,
            connection.hasSecret,
          )}
          initialValues={connectionToFormValues(connection)}
          secretStored={connection.hasSecret}
          submitLabel={t("form.saveChanges")}
          pendingLabel={tCommon("saving")}
        />
      </div>
    </div>
  );
}
