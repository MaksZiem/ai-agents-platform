import { z } from 'zod';
import {
  percentChange,
  roundMoney,
  sumAmounts,
  totalsByCategory,
  transactionsBetween,
} from '../mock/finance.js';
import { defineTool } from '../tool-definition.js';
import { periodSchema } from './schemas.js';

const periodTotalsSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  total: z.number(),
  count: z.number().int(),
});

export const comparePeriodsTool = defineTool({
  name: 'comparePeriods',
  description:
    'Compares spending between two periods (dates inclusive, YYYY-MM-DD): totals, absolute and percentage change, overall and per category.',
  inputSchema: z.object({
    current: periodSchema,
    previous: periodSchema,
  }),
  outputSchema: z.object({
    current: periodTotalsSchema,
    previous: periodTotalsSchema,
    change: z.number(),
    changePercent: z.number().nullable(),
    categories: z.array(
      z.object({
        category: z.string(),
        current: z.number(),
        previous: z.number(),
        change: z.number(),
        changePercent: z.number().nullable(),
      }),
    ),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async ({ current, previous }) => {
    const currentTransactions = transactionsBetween(current);
    const previousTransactions = transactionsBetween(previous);
    const currentTotal = sumAmounts(currentTransactions);
    const previousTotal = sumAmounts(previousTransactions);
    const currentByCategory = totalsByCategory(currentTransactions);
    const previousByCategory = totalsByCategory(previousTransactions);
    const categoryNames = new Set([
      ...currentByCategory.keys(),
      ...previousByCategory.keys(),
    ]);
    const categories = [...categoryNames]
      .map((category) => {
        const currentAmount = sumAmounts(currentByCategory.get(category) ?? []);
        const previousAmount = sumAmounts(
          previousByCategory.get(category) ?? [],
        );

        return {
          category,
          current: currentAmount,
          previous: previousAmount,
          change: roundMoney(currentAmount - previousAmount),
          changePercent: percentChange(currentAmount, previousAmount),
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      current: {
        ...current,
        total: currentTotal,
        count: currentTransactions.length,
      },
      previous: {
        ...previous,
        total: previousTotal,
        count: previousTransactions.length,
      },
      change: roundMoney(currentTotal - previousTotal),
      changePercent: percentChange(currentTotal, previousTotal),
      categories,
    };
  },
});
