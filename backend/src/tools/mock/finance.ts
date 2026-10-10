import { MOCK_TRANSACTIONS, type Transaction } from './transactions.js';

export interface Period {
  from: string;
  to: string;
}

export function transactionsBetween({ from, to }: Period): Transaction[] {
  return MOCK_TRANSACTIONS.filter(
    (transaction) => transaction.date >= from && transaction.date <= to,
  );
}

export function sumAmounts(transactions: Transaction[]): number {
  return roundMoney(
    transactions.reduce((total, transaction) => total + transaction.amount, 0),
  );
}

export function totalsByCategory(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const group = groups.get(transaction.category) ?? [];
    group.push(transaction);
    groups.set(transaction.category, group);
  }

  return groups;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// Percentage change, or null when there is nothing to compare against.
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}
