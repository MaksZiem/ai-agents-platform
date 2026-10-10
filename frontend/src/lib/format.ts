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
