import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import type { DayActivity } from "@/features/dashboard/types";

const SEGMENTS = [
  { key: "completed", className: "bg-success/80" },
  { key: "failed", className: "bg-danger/80" },
  { key: "cancelled", className: "bg-fg-subtle/60" },
  { key: "active", className: "bg-accent/80" },
] as const;

function total(day: DayActivity) {
  return day.completed + day.failed + day.cancelled + day.active;
}

function parseDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ActivityChart({ days }: { days: DayActivity[] }) {
  const t = useTranslations("dashboard.activity");
  const format = useFormat();

  function describeDay(day: DayActivity) {
    const date = format.weekday(parseDay(day.date));
    const parts = SEGMENTS.filter(({ key }) => day[key] > 0).map(({ key }) =>
      t("segmentCount", { count: day[key], segment: t(`segments.${key}`).toLowerCase() }),
    );
    return t("day", { date, parts: parts.length > 0 ? parts.join(", ") : t("noRuns") });
  }

  const runs = days.reduce((sum, day) => sum + total(day), 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);
  const finished = completed + days.reduce((sum, day) => sum + day.failed, 0);
  const max = Math.max(1, ...days.map(total));

  return (
    <section
      aria-labelledby="activity-title"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="activity-title" className="text-base font-semibold">
            {t("title")}
          </h2>
          <p className="text-[13px] text-fg-muted">{t("lead")}</p>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs text-fg-muted">{t("runs")}</dt>
            <dd className="font-mono text-lg font-medium tabular-nums">{runs}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">{t("completed")}</dt>
            <dd className="font-mono text-lg font-medium tabular-nums">
              {finished === 0 ? "—" : format.number(completed / finished, { style: "percent" })}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex h-36 items-end gap-1.5" role="list" aria-label={t("perDay")}>
        {days.map((day, index) => {
          const count = total(day);
          const isToday = index === days.length - 1;

          return (
            <div
              key={day.date}
              role="listitem"
              aria-label={describeDay(day)}
              title={describeDay(day)}
              className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full flex-1 flex-col justify-end">
                {count === 0 ? (
                  <div className="h-0.5 w-full rounded-full bg-border" />
                ) : (
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${(count / max) * 100}%` }}
                  >
                    {SEGMENTS.map(({ key, className }) =>
                      day[key] > 0 ? (
                        <div
                          key={key}
                          className={className}
                          style={{ height: `${(day[key] / count) * 100}%` }}
                        />
                      ) : null,
                    )}
                  </div>
                )}
              </div>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  isToday ? "text-fg" : "text-fg-muted"
                }`}
                aria-hidden
              >
                {parseDay(day.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
        {SEGMENTS.map(({ key, className }) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-sm ${className}`} aria-hidden />
            {t(`segments.${key}`)}
          </li>
        ))}
      </ul>
    </section>
  );
}
