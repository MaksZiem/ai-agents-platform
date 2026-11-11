import type { ToolContext } from '../tool-definition.js';
import { evaluateExpression } from '../expression.js';
import { calculateTool } from './calculate.tool.js';

const context = {} as ToolContext;

describe('evaluateExpression', () => {
  it.each([
    ['1 + 2 * 3', 7],
    ['(1 + 2) * 3', 9],
    ['-2 ^ 2', -4],
    ['2 ^ 3 ^ 2', 512],
    ['10 % 4', 2],
    ['1.5e3 / 3', 500],
    ['round(2 / 3, 2)', 0.67],
    ['sum(1, 2, 3) + avg(2, 4)', 9],
    ['median(5, 1, 3, 2)', 2.5],
    ['pct(25, 200)', 12.5],
    ['pct_change(450, 500)', -10],
    ['round(cagr(100, 121, 2), 6)', 10],
  ])('%s = %d', (expression, expected) => {
    expect(evaluateExpression(expression)).toBeCloseTo(expected, 10);
  });

  it('uses variables', () => {
    expect(evaluateExpression('price * qty', { price: 2.5, qty: 4 })).toBe(10);
  });

  it.each([
    ['1 / 0', 'Division by zero'],
    ['unknown + 1', 'Unknown variable "unknown"'],
    ['constructor(1)', 'Unknown function "constructor"'],
    ['toString + 1', 'Unknown variable "toString"'],
    ['1 +', 'Unexpected end of expression'],
    ['(1 + 2', 'Expected ")"'],
    ['2 $ 3', 'Unexpected character "$"'],
    ['pow(2)', 'pow() got 1 argument(s)'],
    ['', 'Expression is empty'],
  ])('rejects %s', (expression, message) => {
    expect(() => evaluateExpression(expression)).toThrow(message);
  });
});

describe('calculate', () => {
  it('evaluates calculations in order using variables and earlier results', async () => {
    const result = await calculateTool.execute(
      {
        variables: [
          { name: 'booked_q4', value: 610 },
          { name: 'booked_q4_ly', value: 540 },
          { name: 'actual_q4_ly', value: 763 },
        ],
        calculations: [
          { name: 'conversion', expression: 'actual_q4_ly / booked_q4_ly' },
          {
            name: 'forecast_q4',
            expression: 'round(booked_q4 * conversion, 1)',
          },
        ],
      },
      context,
    );

    expect(result.results).toEqual([
      {
        name: 'conversion',
        expression: 'actual_q4_ly / booked_q4_ly',
        value: 1.412963,
      },
      {
        name: 'forecast_q4',
        expression: 'round(booked_q4 * conversion, 1)',
        value: 861.9,
      },
    ]);
    expect(calculateTool.outputSchema.parse(result)).toEqual(result);
  });

  it('names the calculation that failed', async () => {
    await expect(
      calculateTool.execute(
        { calculations: [{ name: 'ratio', expression: 'a / 0' }] },
        context,
      ),
    ).rejects.toThrow('Calculation "ratio" failed: Unknown variable "a"');
  });
});
