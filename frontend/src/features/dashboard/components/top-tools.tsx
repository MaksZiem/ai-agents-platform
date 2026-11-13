import Link from "next/link";
import type { ToolUsage } from "@/features/dashboard/types";

export function TopTools({ tools }: { tools: ToolUsage[] }) {
  const max = Math.max(1, ...tools.map((tool) => tool.calls));

  return (
    <section
      aria-labelledby="top-tools-title"
      className="rounded-xl border border-border bg-surface"
    >
      <div className="border-b border-border px-[18px] py-3">
        <h2 id="top-tools-title" className="text-base font-semibold">
          Top tools
        </h2>
        <p className="text-[13px] text-fg-muted">Calls in the last 7 days</p>
      </div>

      {tools.length === 0 ? (
        <p className="px-[18px] py-6 text-center text-[13px] text-fg-muted">
          No tool calls yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3 px-[18px] py-3">
          {tools.map((tool) => {
            const failedShare = tool.failed / tool.calls;

            return (
              <li key={tool.toolName} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <Link
                    href={`/tools#${tool.toolName}`}
                    className="truncate font-mono hover:underline"
                  >
                    {tool.toolName}
                  </Link>
                  <span className="shrink-0 font-mono text-xs text-fg-muted tabular-nums">
                    {tool.calls}
                    {tool.failed > 0 && (
                      <span className="text-danger">
                        {" "}
                        · {Math.round(failedShare * 100)}% failed
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className="flex h-1.5 overflow-hidden rounded-full bg-surface-2"
                  aria-hidden
                >
                  <div
                    className="flex h-full overflow-hidden rounded-full"
                    style={{ width: `${(tool.calls / max) * 100}%` }}
                  >
                    <div className="h-full flex-1 bg-fg-muted/50" />
                    {tool.failed > 0 && (
                      <div
                        className="h-full bg-danger/80"
                        style={{ width: `${failedShare * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
