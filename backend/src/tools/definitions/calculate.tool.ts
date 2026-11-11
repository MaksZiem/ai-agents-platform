import { z } from 'zod';
import { EXPRESSION_FUNCTIONS, evaluateExpression } from '../expression.js';
import { defineTool } from '../tool-definition.js';

const identifierSchema = z
  .string()
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/, 'Use letters, digits and _ only');

export const calculateTool = defineTool({
  name: 'calculate',
  description: `Evaluates arithmetic exactly. Use it for every number you report instead of calculating in your head: totals, differences, ratios, growth, forecasts. Pass the numbers you found as variables, then a list of named calculations; each calculation can use the variables and the results of earlier calculations. Operators: + - * / % ^ and parentheses. Functions: ${EXPRESSION_FUNCTIONS.join(', ')}. pct(part, whole) and pct_change(current, previous) return percentages; cagr(start, end, periods) returns a percentage per period. Example: variables [{"name": "booked_q4", "value": 610}, {"name": "booked_q4_ly", "value": 540}, {"name": "actual_q4_ly", "value": 763}], calculations [{"name": "conversion", "expression": "actual_q4_ly / booked_q4_ly"}, {"name": "forecast_q4", "expression": "booked_q4 * conversion"}].`,
  inputSchema: z.object({
    variables: z
      .array(z.object({ name: identifierSchema, value: z.number() }))
      .max(200)
      .optional(),
    calculations: z
      .array(
        z.object({
          name: identifierSchema,
          expression: z.string().min(1).max(500),
        }),
      )
      .min(1)
      .max(50),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        name: z.string(),
        expression: z.string(),
        value: z.number(),
      }),
    ),
  }),
  permission: { resource: 'financial_data', action: 'read' },
  requiresApproval: false,
  execute: async ({ variables = [], calculations }) => {
    const scope: Record<string, number> = Object.fromEntries(
      variables.map(({ name, value }) => [name, value]),
    );
    const results = calculations.map(({ name, expression }) => {
      let value: number;

      try {
        value = evaluateExpression(expression, scope);
      } catch (error) {
        throw new Error(
          `Calculation "${name}" failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      scope[name] = value;

      return { name, expression, value: Math.round(value * 1e6) / 1e6 };
    });

    return { results };
  },
});
