import type { ToolContext } from '../tool-definition.js';
import { analyzeTransactionsTool } from './analyze-transactions.tool.js';
import { comparePeriodsTool } from './compare-periods.tool.js';

const context = {} as ToolContext;
const q1 = { from: '2026-01-01', to: '2026-03-31' };
const q4 = { from: '2025-10-01', to: '2025-12-31' };

describe('analyzeTransactions', () => {
  it('totals spending per category and flags unusual expenses', async () => {
    const result = await analyzeTransactionsTool.execute(q1, context);

    expect(result.total).toBe(32_265);
    expect(result.categories[0]).toMatchObject({
      category: 'rent',
      total: 13_500,
    });
    expect(result.largest[0].description).toBe('Laptop purchase');
    expect(
      result.anomalies.map((anomaly) => anomaly.transaction.description),
    ).toEqual(['Laptop purchase', 'AWS']);
    expect(analyzeTransactionsTool.outputSchema.parse(result)).toEqual(result);
  });

  it('handles a period without transactions', async () => {
    const result = await analyzeTransactionsTool.execute(
      { from: '2020-01-01', to: '2020-12-31' },
      context,
    );

    expect(result).toMatchObject({ count: 0, total: 0, anomalies: [] });
  });
});

describe('comparePeriods', () => {
  it('reports overall and per-category change', async () => {
    const result = await comparePeriodsTool.execute(
      { current: q1, previous: q4 },
      context,
    );

    expect(result).toMatchObject({ change: 13_015, changePercent: 67.6 });
    expect(result.categories).toContainEqual({
      category: 'equipment',
      current: 9_800,
      previous: 0,
      change: 9_800,
      changePercent: null,
    });
    expect(comparePeriodsTool.outputSchema.parse(result)).toEqual(result);
  });
});
