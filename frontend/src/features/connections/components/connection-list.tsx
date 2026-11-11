import Link from "next/link";
import { Plug } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { AUTH_TYPE_LABELS } from "@/features/connections/form";
import type { Connection } from "@/features/connections/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_150px_200px]";

export function ConnectionList({ connections }: { connections: Connection[] }) {
  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <Plug className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="text-sm">No connections yet</p>
          <p className="text-[13px] text-fg-muted">
            Connect an API so agents can call it with the httpRequest tool.
          </p>
        </div>
        <Link href="/connections/new" className={buttonClasses("primary")}>
          New connection
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>Connection</span>
        <span className="hidden md:block">Authentication</span>
        <span>Methods</span>
      </div>

      <ul className="divide-y divide-border">
        {connections.map((connection) => (
          <li key={connection.id}>
            <Link
              href={`/connections/${connection.id}`}
              className={`${ROW_GRID} px-[18px] py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-[13px] font-medium">
                  {connection.name}
                </p>
                <p className="truncate font-mono text-xs text-fg-muted">
                  {connection.baseUrl}
                </p>
              </div>
              <span className="hidden text-[13px] text-fg-muted md:block">
                {AUTH_TYPE_LABELS[connection.authType]}
              </span>
              <span className="flex flex-wrap gap-1">
                {connection.allowedMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-fg-muted"
                  >
                    {method}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
