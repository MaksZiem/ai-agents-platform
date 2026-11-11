import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ConnectionList } from "@/features/connections/components/connection-list";
import { apiFetch } from "@/lib/api";
import type { Connection } from "@/features/connections/types";

export const metadata: Metadata = {
  title: "Connections",
};

export default async function ConnectionsPage() {
  const connections = await apiFetch<Connection[]>("/connections");

  return (
    <div>
      <PageHeader
        title="Connections"
        description="APIs your agents can call with the httpRequest tool. Attach a connection to an agent on its page."
        actions={
          <Link href="/connections/new" className={buttonClasses("primary")}>
            New connection
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-4xl p-6">
        <ConnectionList connections={connections} />
      </div>
    </div>
  );
}
