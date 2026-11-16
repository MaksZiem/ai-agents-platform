import Link from "next/link";
import { useTranslations } from "next-intl";
import type { FileSource } from "@/features/files/types";

const FILTERS: (FileSource | null)[] = [null, "uploaded", "generated"];

type FileSourceFilterProps = {
  active: FileSource | null;
  counts: Record<FileSource | "all", number>;
};

export function FileSourceFilter({ active, counts }: FileSourceFilterProps) {
  const t = useTranslations("files.filter");

  return (
    <nav aria-label={t("label")} className="flex flex-wrap gap-1">
      {FILTERS.map((source) => {
        const label = t(source ?? "all");
        const isActive = source === active;

        return (
          <Link
            key={source ?? "all"}
            href={source ? `/files?source=${source}` : "/files"}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {label}
            <span className="font-mono text-xs text-fg-muted">
              {counts[source ?? "all"]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
