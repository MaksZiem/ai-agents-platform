import type { ExecutionStep } from "@/lib/types";


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

export function getStepDurationMs(
  step: Pick<ExecutionStep, "startedAt" | "finishedAt">,
) {
  if (!step.startedAt || !step.finishedAt) return null;
  return new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime();
}

export function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}


