import type { ToolContext } from '../tool-definition.js';
import { analyzeTransactionsTool } from './analyze-transactions.tool.js';

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
