import { z } from 'zod';
import { defineTool } from '../tool-definition.js';
import { transactionsBetween } from '../mock/finance.js';
import { periodSchema, transactionSchema } from './schemas.js';

export const getTransactionsTool = defineTool({
  name: 'getTransactions',
  description:
    'Returns financial transactions between two dates (inclusive). Dates use the YYYY-MM-DD format.',
  inputSchema: periodSchema,
  outputSchema: z.object({
    transactions: z.array(transactionSchema),
    count: z.number().int(),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async (period) => {
    const transactions = transactionsBetween(period);

    return { transactions, count: transactions.length };
  },
});
