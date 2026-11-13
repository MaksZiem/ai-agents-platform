import Link from "next/link";
import { Plug } from "lucide-react";
import { ItemPicker } from "@/components/ui/item-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  attachConnections,
  detachConnection,
} from "@/features/connections/actions";
import type {
  AgentConnection,
  Connection,
} from "@/features/connections/types";

type AgentConnectionsProps = {
  agentId: string;
  attached: AgentConnection[];
  library: Connection[];
};

export function AgentConnections({
  agentId,
  attached,
  library,
}: AgentConnectionsProps) {
  const attachedIds = new Set(attached.map((connection) => connection.id));
  const available = library.filter(
    (connection) => !attachedIds.has(connection.id),
  );

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-[18px] py-3">
        <h2 className="text-base font-semibold">Connections</h2>
        <p className="text-[13px] text-fg-muted">
          APIs this agent can call with the httpRequest tool. Remove only
          detaches the connection from this agent.
        </p>
      </div>

      {attached.length === 0 ? (
        <p className="px-[18px] py-4 text-[13px] text-fg-muted">
          No connections attached.
        </p>
      ) : (
        <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
          {attached.map((connection) => (
            <li
              key={connection.id}
              className="flex items-center gap-3 px-[18px] py-2"
            >
              <Plug
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/connections/${connection.id}`}
                  className="block truncate font-mono text-[13px] hover:underline"
                >
                  {connection.name}
                </Link>
                <p className="truncate font-mono text-xs text-fg-muted">
                  {connection.baseUrl}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-fg-muted sm:block">
                {connection.allowedMethods.join(" · ")}
              </span>
              <form
                action={detachConnection.bind(null, agentId, connection.id)}
              >
                <SubmitButton
                  variant="ghost"
                  pendingLabel="Removing…"
                  title="Detach from this agent. The connection stays available for other agents."
                >
                  Remove
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-[18px] py-3">
        {available.length > 0 ? (
          <ItemPicker
            items={available.map((connection) => ({
              id: connection.id,
              label: connection.name,
              meta: connection.baseUrl,
            }))}
            action={attachConnections.bind(null, agentId)}
            icon={
              <Plug
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            openLabel="Add connections"
            searchLabel="Search connections by name or URL…"
            noun={{ one: "connection", other: "connections" }}
          />
        ) : (
          <p className="text-[13px] text-fg-muted">
            {library.length === 0 ? (
              <>
                No connections yet.{" "}
                <Link
                  href="/connections/new"
                  className="text-accent hover:underline"
                >
                  Add one
                </Link>
                .
              </>
            ) : (
              "Every connection is attached."
            )}
          </p>
        )}
      </div>
    </section>
  );
}
