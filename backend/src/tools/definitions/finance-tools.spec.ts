import type { ToolContext } from '../tool-definition.js';
import { analyzeTransactionsTool } from './analyze-transactions.tool.js';
import { comparePeriodsTool } from './compare-periods.tool.js';

const context = {} as ToolContext;

const transactions = [
  {
    date: '2026-01-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    date: '2026-02-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    date: '2026-01-12',
    description: 'AWS',
    category: 'software',
    amount: 1300,
  },
  {
    date: '2026-02-12',
    description: 'AWS',
    category: 'software',
    amount: 1250,
  },
  {
    date: '2026-03-12',
    description: 'AWS',
    category: 'software',
    amount: 4870,
  },
  {
    date: '2026-02-27',
    description: 'Laptop purchase',
    category: 'equipment',
    amount: 9800,
  },
];

describe('analyzeTransactions', () => {
  it('totals the given transactions per category and flags unusual ones', async () => {
    const result = await analyzeTransactionsTool.execute(
      { transactions },
      context,
    );

    expect(result.total).toBe(26_220);
    expect(result.categories[0]).toMatchObject({
      category: 'equipment',
      total: 9_800,
    });
    expect(result.largest[0].description).toBe('Laptop purchase');
    expect(
      result.anomalies.map((anomaly) => anomaly.transaction.description),
    ).toEqual(['AWS', 'Laptop purchase']);
    expect(analyzeTransactionsTool.outputSchema.parse(result)).toEqual(result);
  });
});

describe('comparePeriods', () => {
  it('reports the change between consecutive periods and overall', async () => {
    const result = await comparePeriodsTool.execute(
      {
        metric: 'Revenue (kEUR)',
        periods: [
          { label: 'Q2 2026', value: 400 },
          { label: 'Q3 2026', value: 500 },
          { label: 'Q4 2026', value: 450 },
        ],
      },
      context,
    );

    expect(result.periods.map((period) => period.changePercent)).toEqual([
      null,
      25,
      -10,
    ]);
    expect(result.overall).toEqual({
      from: 'Q2 2026',
      to: 'Q4 2026',
      change: 50,
      changePercent: 12.5,
    });
    expect(result.averageChange).toBe(25);
    expect(result.averageChangePercent).toBe(7.5);
    expect(comparePeriodsTool.outputSchema.parse(result)).toEqual(result);
  });

  it('returns no percentage when the previous value is zero', async () => {
    const result = await comparePeriodsTool.execute(
      {
        periods: [
          { label: 'Jan', value: 0 },
          { label: 'Feb', value: 120 },
        ],
      },
      context,
    );

    expect(result.periods[1]).toMatchObject({
      change: 120,
      changePercent: null,
    });
    expect(result.averageChangePercent).toBeNull();
  });
});
