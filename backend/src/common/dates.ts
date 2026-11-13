export function startOfDay(date: Date, daysAgo = 0): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - daysAgo);
  return day;
}
