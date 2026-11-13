import type { DayActivity } from "@/features/dashboard/types";

const SEGMENTS = [
  { key: "completed", label: "Completed", className: "bg-success/80" },
  { key: "failed", label: "Failed", className: "bg-danger/80" },
  { key: "cancelled", label: "Cancelled", className: "bg-fg-subtle/60" },
  { key: "active", label: "In progress", className: "bg-accent/80" },
] as const;

function total(day: DayActivity) {
  return day.completed + day.failed + day.cancelled + day.active;
}

function parseDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function describeDay(day: DayActivity) {
  const label = parseDay(day.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const parts = SEGMENTS.filter(({ key }) => day[key] > 0).map(
    ({ key, label: segment }) => `${day[key]} ${segment.toLowerCase()}`,
  );
  return `${label}: ${parts.length > 0 ? parts.join(", ") : "no runs"}`;
}

export function ActivityChart({ days }: { days: DayActivity[] }) {
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
            Activity
          </h2>
          <p className="text-[13px] text-fg-muted">Executions in the last 14 days</p>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs text-fg-muted">Runs</dt>
            <dd className="font-mono text-lg font-medium tabular-nums">{runs}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Completed</dt>
            <dd className="font-mono text-lg font-medium tabular-nums">
              {finished === 0 ? "—" : `${Math.round((completed / finished) * 100)}%`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex h-36 items-end gap-1.5" role="list" aria-label="Runs per day">
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
        {SEGMENTS.map(({ key, label, className }) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-sm ${className}`} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
