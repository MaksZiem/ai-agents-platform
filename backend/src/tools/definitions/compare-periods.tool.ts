import { z } from 'zod';
import { percentChange, roundMoney } from '../finance.js';
import { defineTool } from '../tool-definition.js';
import { periodValueSchema } from './schemas.js';

export const comparePeriodsTool = defineTool({
  name: 'comparePeriods',
  description:
    'Calculates how a metric changes over consecutive periods. Pass the values you found in the data (e.g. quarterly revenue read from a document), oldest first. Returns the absolute and percentage change between each pair of periods, the overall change and the average change per period. Use it instead of calculating changes yourself.',
  inputSchema: z.object({
    metric: z.string().min(1).max(100).optional(),
    periods: z.array(periodValueSchema).min(2).max(60),
  }),
  outputSchema: z.object({
    metric: z.string().nullable(),
    periods: z.array(
      periodValueSchema.extend({
        change: z.number().nullable(),
        changePercent: z.number().nullable(),
      }),
    ),
    overall: z.object({
      from: z.string(),
      to: z.string(),
      change: z.number(),
      changePercent: z.number().nullable(),
    }),
    averageChange: z.number(),
    averageChangePercent: z.number().nullable(),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async ({ metric, periods }) => {
    const rows = periods.map((period, index) => {
      const previous = periods[index - 1];

      return {
        ...period,
        change: previous ? roundMoney(period.value - previous.value) : null,
        changePercent: previous
          ? percentChange(period.value, previous.value)
          : null,
      };
    });
    const first = periods[0];
    const last = periods[periods.length - 1];
    const steps = rows.slice(1);
    const percents = steps.flatMap((row) =>
      row.changePercent === null ? [] : [row.changePercent],
    );

    return {
      metric: metric ?? null,
      periods: rows,
      overall: {
        from: first.label,
        to: last.label,
        change: roundMoney(last.value - first.value),
        changePercent: percentChange(last.value, first.value),
      },
      averageChange: roundMoney((last.value - first.value) / steps.length),
      averageChangePercent:
        percents.length === 0
          ? null
          : Math.round(
              (percents.reduce((total, value) => total + value, 0) /
                percents.length) *
                10,
            ) / 10,
    };
  },
});
