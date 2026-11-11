import { z } from 'zod';
import { groupBy, roundMoney, sumAmounts } from '../finance.js';
import { defineTool } from '../tool-definition.js';
import { transactionSchema } from './schemas.js';

type Transaction = z.infer<typeof transactionSchema>;

const ANOMALY_FACTOR = 1.5;
const NEW_CATEGORY_THRESHOLD = 5_000;

export const analyzeTransactionsTool = defineTool({
  name: 'analyzeTransactions',
  description:
    'Analyzes a list of transactions you pass in (e.g. rows read from an uploaded CSV or document): total, totals per category, largest items and unusual transactions compared with the rest of their category. Use it instead of adding up amounts yourself.',
  inputSchema: z.object({
    transactions: z.array(transactionSchema).min(1).max(2_000),
  }),
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
  execute: async ({ transactions }) => {
    const total = sumAmounts(transactions);
    const byCategory = groupBy(transactions, (item) => item.category);
    const categories = [...byCategory]
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
      const reason = findAnomaly(
        transaction,
        (byCategory.get(transaction.category) ?? []).filter(
          (other) => other !== transaction,
        ),
      );
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

function findAnomaly(
  transaction: Transaction,
  others: Transaction[],
): string | null {
  if (others.length === 0) {
    return transaction.amount >= NEW_CATEGORY_THRESHOLD
      ? `Only expense in category "${transaction.category}"`
      : null;
  }

  const average = sumAmounts(others) / others.length;

  if (average > 0 && transaction.amount > average * ANOMALY_FACTOR) {
    const times = roundMoney(transaction.amount / average);
    return `${times}x the usual "${transaction.category}" amount of ${roundMoney(average)}`;
  }

  return null;
}
