import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { createConnection } from "@/features/connections/actions";
import { ConnectionForm } from "@/features/connections/components/connection-form";
import { EMPTY_CONNECTION_FORM } from "@/features/connections/form";

export const metadata: Metadata = {
  title: "New connection",
};

export default function NewConnectionPage() {
  return (
    <div>
      <PageHeader
        title="New connection"
        description="Give agents controlled access to an HTTP API."
      />

      <div className="p-6">
        <ConnectionForm
          action={createConnection}
          initialValues={EMPTY_CONNECTION_FORM}
          secretStored={false}
          submitLabel="Create connection"
          pendingLabel="Creating…"
        />
      </div>
    </div>
  );
}
