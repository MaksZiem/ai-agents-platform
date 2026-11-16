import Link from "next/link";
import { Plug } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import type { Connection } from "@/features/connections/types";

const ROW_GRID =
  "grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_150px_200px]";

export function ConnectionList({ connections }: { connections: Connection[] }) {
  const t = useTranslations("connections");

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <Plug className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="text-sm">{t("empty.title")}</p>
          <p className="text-[13px] text-fg-muted">{t("empty.body")}</p>
        </div>
        <Link href="/connections/new" className={buttonClasses("primary")}>
          {t("new")}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className={`${ROW_GRID} border-b border-border px-[18px] py-2.5 text-xs font-medium text-fg-muted`}
      >
        <span>{t("columns.connection")}</span>
        <span className="hidden md:block">{t("columns.auth")}</span>
        <span>{t("columns.methods")}</span>
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
                {t(`authTypes.${connection.authType}`)}
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
