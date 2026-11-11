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
  const connection = await getConnection(id);

  return (
    <div>
      <PageHeader
        title={connection.name}
        description={connection.baseUrl}
        actions={
          <ConfirmForm
            action={deleteConnection.bind(null, connection.id)}
            title={`Delete "${connection.name}"?`}
            message="The connection and its saved secret are removed and every agent loses access to this API. This cannot be undone."
            confirmLabel="Delete connection"
          >
            <SubmitButton pendingLabel="Deleting…">Delete</SubmitButton>
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
          submitLabel="Save changes"
          pendingLabel="Saving…"
        />
      </div>
    </div>
  );
}
