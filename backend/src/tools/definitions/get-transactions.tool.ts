import { z } from 'zod';
import { defineTool } from '../tool-definition.js';
import { MOCK_TRANSACTIONS } from '../mock/transactions.js';

export const getTransactionsTool = defineTool({
  name: 'getTransactions',
  description:
    'Returns financial transactions between two dates (inclusive). Dates use the YYYY-MM-DD format.',
  inputSchema: z.object({
    from: z.iso.date(),
    to: z.iso.date(),
  }),
  outputSchema: z.object({
    transactions: z.array(
      z.object({
        id: z.string(),
        date: z.iso.date(),
        description: z.string(),
        category: z.string(),
        amount: z.number(),
      }),
    ),
    count: z.number().int(),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async ({ from, to }) => {
    const transactions = MOCK_TRANSACTIONS.filter(
      (transaction) => transaction.date >= from && transaction.date <= to,
    );

    return { transactions, count: transactions.length };
  },
});
