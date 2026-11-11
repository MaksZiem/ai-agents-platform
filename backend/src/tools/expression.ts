export class ExpressionError extends Error {}

type Token =
  | { type: 'number'; value: number }
  | { type: 'name'; value: string }
  | { type: 'symbol'; value: string };

const SYMBOLS = new Set(['+', '-', '*', '/', '%', '^', '(', ')', ',']);

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

const FUNCTIONS: Record<
  string,
  { arity: [number, number]; apply: (args: number[]) => number }
> = {
  abs: { arity: [1, 1], apply: ([x]) => Math.abs(x) },
  sqrt: { arity: [1, 1], apply: ([x]) => Math.sqrt(x) },
  floor: { arity: [1, 1], apply: ([x]) => Math.floor(x) },
  ceil: { arity: [1, 1], apply: ([x]) => Math.ceil(x) },
  round: {
    arity: [1, 2],
    apply: ([x, digits = 0]) => {
      const factor = 10 ** digits;
      return Math.round(x * factor) / factor;
    },
  },
  pow: { arity: [2, 2], apply: ([x, y]) => x ** y },
  min: { arity: [1, Infinity], apply: (args) => Math.min(...args) },
  max: { arity: [1, Infinity], apply: (args) => Math.max(...args) },
  sum: {
    arity: [1, Infinity],
    apply: (args) => args.reduce((total, value) => total + value, 0),
  },
  avg: { arity: [1, Infinity], apply: mean },
  median: {
    arity: [1, Infinity],
    apply: (args) => {
      const sorted = [...args].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
    },
  },
  stdev: {
    arity: [2, Infinity],
    apply: (args) => {
      const average = mean(args);
      return Math.sqrt(
        args.reduce((total, value) => total + (value - average) ** 2, 0) /
          (args.length - 1),
      );
    },
  },
  pct: {
    arity: [2, 2],
    apply: ([part, whole]) => (part / whole) * 100,
  },
  pct_change: {
    arity: [2, 2],
    apply: ([current, previous]) =>
      ((current - previous) / Math.abs(previous)) * 100,
  },
  cagr: {
    arity: [3, 3],
    apply: ([start, end, periods]) =>
      ((end / start) ** (1 / periods) - 1) * 100,
  },
};

export const EXPRESSION_FUNCTIONS = Object.keys(FUNCTIONS);

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    const number = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/i.exec(
      expression.slice(index),
    );

    if (number) {
      tokens.push({ type: 'number', value: Number(number[0]) });
      index += number[0].length;
      continue;
    }

    const name = /^[a-z_][a-z0-9_]*/i.exec(expression.slice(index));

    if (name) {
      tokens.push({ type: 'name', value: name[0] });
      index += name[0].length;
      continue;
    }

    if (SYMBOLS.has(char)) {
      tokens.push({ type: 'symbol', value: char });
      index += 1;
      continue;
    }

    throw new ExpressionError(`Unexpected character "${char}"`);
  }

  return tokens;
}

class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly variables: Record<string, number>,
  ) {}

  parse(): number {
    if (this.tokens.length === 0) {
      throw new ExpressionError('Expression is empty');
    }

    const value = this.expression();

    if (this.position < this.tokens.length) {
      throw new ExpressionError(
        `Unexpected "${String(this.tokens[this.position].value)}"`,
      );
    }

    return value;
  }

  private peekSymbol(...symbols: string[]): string | null {
    const token = this.tokens[this.position];
    return token?.type === 'symbol' && symbols.includes(token.value)
      ? token.value
      : null;
  }

  private expect(symbol: string) {
    if (!this.peekSymbol(symbol)) {
      throw new ExpressionError(`Expected "${symbol}"`);
    }

    this.position += 1;
  }

  private expression(): number {
    let value = this.term();
    let operator = this.peekSymbol('+', '-');

    while (operator) {
      this.position += 1;
      const right = this.term();
      value = operator === '+' ? value + right : value - right;
      operator = this.peekSymbol('+', '-');
    }

    return value;
  }

  private term(): number {
    let value = this.unary();
    let operator = this.peekSymbol('*', '/', '%');

    while (operator) {
      this.position += 1;
      const right = this.unary();

      if (operator !== '*' && right === 0) {
        throw new ExpressionError('Division by zero');
      }

      value =
        operator === '*'
          ? value * right
          : operator === '/'
            ? value / right
            : value % right;
      operator = this.peekSymbol('*', '/', '%');
    }

    return value;
  }

  private unary(): number {
    const operator = this.peekSymbol('+', '-');

    if (operator) {
      this.position += 1;
      const value = this.unary();
      return operator === '-' ? -value : value;
    }

    return this.power();
  }

  private power(): number {
    const base = this.primary();

    if (this.peekSymbol('^')) {
      this.position += 1;
      return base ** this.unary();
    }

    return base;
  }

  private primary(): number {
    const token = this.tokens[this.position];

    if (!token) {
      throw new ExpressionError('Unexpected end of expression');
    }

    this.position += 1;

    if (token.type === 'number') {
      return token.value;
    }

    if (token.type === 'symbol') {
      if (token.value !== '(') {
        throw new ExpressionError(`Unexpected "${token.value}"`);
      }

      const value = this.expression();
      this.expect(')');
      return value;
    }

    if (this.peekSymbol('(')) {
      return this.call(token.value);
    }

    if (!Object.hasOwn(this.variables, token.value)) {
      throw new ExpressionError(`Unknown variable "${token.value}"`);
    }

    return this.variables[token.value];
  }

  private call(name: string): number {
    const fn = Object.hasOwn(FUNCTIONS, name) ? FUNCTIONS[name] : undefined;

    if (!fn) {
      throw new ExpressionError(`Unknown function "${name}"`);
    }

    this.expect('(');
    const args: number[] = [];

    if (!this.peekSymbol(')')) {
      args.push(this.expression());

      while (this.peekSymbol(',')) {
        this.position += 1;
        args.push(this.expression());
      }
    }

    this.expect(')');

    const [minArgs, maxArgs] = fn.arity;

    if (args.length < minArgs || args.length > maxArgs) {
      throw new ExpressionError(`${name}() got ${args.length} argument(s)`);
    }

    return fn.apply(args);
  }
}

export function evaluateExpression(
  expression: string,
  variables: Record<string, number> = {},
): number {
  const value = new Parser(tokenize(expression), variables).parse();

  if (!Number.isFinite(value)) {
    throw new ExpressionError('Result is not a finite number');
  }

  return value;
}
