import { useFormatter, useTranslations, type NumberFormatOptions } from "next-intl";

type Formatter = ReturnType<typeof useFormatter>;
type FormatMessages = ReturnType<typeof useTranslations<"format">>;

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

export function createFormat(format: Formatter, t: FormatMessages) {
  function number(value: number, options?: NumberFormatOptions) {
    return format.number(value, options);
  }

  function executionDate(iso: string, now = new Date()) {
    const date = new Date(iso);
    const time = format.dateTime(date, { hour: "2-digit", minute: "2-digit" });

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (date >= startOfToday) return t("today", { time });
    if (date >= startOfYesterday) return t("yesterday", { time });

    return format.dateTime(date, { day: "numeric", month: "short" });
  }

  function shortDate(iso: string) {
    return format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" });
  }

  function duration(ms: number) {
    if (ms < 1000) return t("milliseconds", { value: ms });

    const seconds = ms / 1000;
    if (seconds < 60) {
      return t("seconds", { value: number(seconds, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });
    }

    return t("minutes", { minutes: Math.floor(seconds / 60), seconds: Math.round(seconds % 60) });
  }

  function bytes(value: number) {
    const oneDecimal = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    if (value < 1024) return t("bytes", { value });
    if (value < 1024 * 1024) return t("kilobytes", { value: number(value / 1024, oneDecimal) });
    return t("megabytes", { value: number(value / (1024 * 1024), oneDecimal) });
  }

  function weekday(date: Date) {
    return format.dateTime(date, { weekday: "short", month: "short", day: "numeric" });
  }

  function compact(value: number) {
    return number(value, { notation: "compact", maximumFractionDigits: 1 });
  }

  return { number, executionDate, shortDate, weekday, duration, bytes, compact };
}

export type Format = ReturnType<typeof createFormat>;

export function useFormat(): Format {
  return createFormat(useFormatter(), useTranslations("format"));
}
