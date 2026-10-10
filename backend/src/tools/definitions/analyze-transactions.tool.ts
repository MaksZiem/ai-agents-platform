import { z } from 'zod';
import {
  roundMoney,
  sumAmounts,
  totalsByCategory,
  transactionsBetween,
} from '../mock/finance.js';
import { MOCK_TRANSACTIONS, type Transaction } from '../mock/transactions.js';
import { defineTool } from '../tool-definition.js';
import { periodSchema, transactionSchema } from './schemas.js';

// A transaction this many times above its category's usual amount is unusual.
const ANOMALY_FACTOR = 1.5;
// A first-ever expense in a category is unusual from this amount up.
const NEW_CATEGORY_THRESHOLD = 5_000;

export const analyzeTransactionsTool = defineTool({
  name: 'analyzeTransactions',
  description:
    'Analyzes spending between two dates (inclusive, YYYY-MM-DD): total, totals per category, largest expenses and unusual transactions. Use it instead of adding up amounts yourself.',
  inputSchema: periodSchema,
  outputSchema: z.object({
    count: z.number().int(),
    total: z.number(),
    categories: z.array(
      z.object({
        category: z.string(),
        total: z.number(),
        count: z.number().int(),
        sharePercent: z.number(),
      }),
    ),
    largest: z.array(transactionSchema),
    anomalies: z.array(
      z.object({ transaction: transactionSchema, reason: z.string() }),
    ),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async (period) => {
    const transactions = transactionsBetween(period);
    const total = sumAmounts(transactions);
    const categories = [...totalsByCategory(transactions)]
      .map(([category, items]) => {
        const categoryTotal = sumAmounts(items);

        return {
          category,
          total: categoryTotal,
          count: items.length,
          sharePercent:
            total === 0 ? 0 : roundMoney((categoryTotal / total) * 100),
        };
      })
      .sort((a, b) => b.total - a.total);
    const largest = [...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const anomalies = transactions.flatMap((transaction) => {
      const reason = findAnomaly(transaction);
      return reason ? [{ transaction, reason }] : [];
    });

    return {
      count: transactions.length,
      total,
      categories,
      largest,
      anomalies,
    };
  },
});

// Compares a transaction with the rest of its category's history.
function findAnomaly(transaction: Transaction): string | null {
  const others = MOCK_TRANSACTIONS.filter(
    (other) =>
      other.category === transaction.category && other.id !== transaction.id,
  );

  if (others.length === 0) {
    return transaction.amount >= NEW_CATEGORY_THRESHOLD
      ? `First expense in category "${transaction.category}"`
      : null;
  }

  const average = sumAmounts(others) / others.length;

  if (transaction.amount > average * ANOMALY_FACTOR) {
    const times = roundMoney(transaction.amount / average);
    return `${times}x the usual "${transaction.category}" amount of ${roundMoney(average)}`;
  }

  return null;
}
