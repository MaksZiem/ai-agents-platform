export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sumAmounts(items: { amount: number }[]): number {
  return roundMoney(items.reduce((total, item) => total + item.amount, 0));
}

export function groupBy<T>(
  items: T[],
  key: (item: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const group = groups.get(key(item)) ?? [];
    group.push(item);
    groups.set(key(item), group);
  }

  return groups;
}

export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}
