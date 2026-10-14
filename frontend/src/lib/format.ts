const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

export function formatExecutionDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-GB", TIME_FORMAT);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return `Today ${time}`;
  if (date >= startOfYesterday) return `Yesterday ${time}`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}

type TimeRange = {
  startedAt: string | null;
  finishedAt: string | null;
};

export function getDurationMs({ startedAt, finishedAt }: TimeRange) {
  if (!startedAt || !finishedAt) return null;
  return new Date(finishedAt).getTime() - new Date(startedAt).getTime();
}

export function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
