export type CellValue = string | number | null;

export type ColumnType = 'number' | 'text';

export interface Table {
  columns: { name: string; type: ColumnType }[];
  rows: CellValue[][];
}

const DELIMITERS = [',', ';', '\t', '|'] as const;
const MAX_COLUMNS = 50;
const MAX_CELL_LENGTH = 500;
const CURRENCY_PREFIX = /^(?:[$€£¥₹]|zł|pln|usd|eur|gbp|chf)/i;
const CURRENCY_SUFFIX = /(?:[$€£¥₹%]|zł|pln|usd|eur|gbp|chf)$/i;

export function parseNumber(raw: string): number | null {
  let text = raw.trim().replace(/[\s ']/g, '');
  let negative = false;

  if (/^\(.+\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }

  text = text.replace(CURRENCY_PREFIX, '').replace(CURRENCY_SUFFIX, '');

  if (text.startsWith('-') || text.startsWith('+')) {
    negative = negative !== text.startsWith('-');
    text = text.slice(1);
  }

  text = text.replace(CURRENCY_PREFIX, '');

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    text =
      lastComma > lastDot
        ? text.replaceAll('.', '').replace(',', '.')
        : text.replaceAll(',', '');
  } else if (lastComma !== -1) {
    text = /^\d{1,3}(,\d{3})+$/.test(text)
      ? text.replaceAll(',', '')
      : text.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3}){2,}$/.test(text)) {
    text = text.replaceAll('.', '');
  }

  if (!/^\d+(\.\d+)?$/.test(text)) {
    return null;
  }

  const value = Number(text);
  return negative ? -value : value;
}

function splitDelimited(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const char = content[index];

    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.trim() === '') {
      quoted = true;
      cell = '';
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[index + 1] === '\n') index++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ''));
}

function countOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let quoted = false;

  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) count++;
  }

  return count;
}

export function detectDelimiter(content: string): string | null {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .slice(0, 10);

  if (lines.length < 2) {
    return null;
  }

  let best: { delimiter: string; count: number } | null = null;

  for (const delimiter of DELIMITERS) {
    const counts = lines.map((line) => countOutsideQuotes(line, delimiter));
    const consistent = counts.every((count) => count === counts[0]);

    if (consistent && counts[0] > 0 && (!best || counts[0] > best.count)) {
      best = { delimiter, count: counts[0] };
    }
  }

  return best?.delimiter ?? null;
}

function columnNames(header: string[]): string[] {
  const seen = new Map<string, number>();

  return header.map((raw, index) => {
    const base = raw.trim() || `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

export function buildTable(grid: string[][]): Table | null {
  if (grid.length === 0) {
    return null;
  }

  const width = Math.min(
    MAX_COLUMNS,
    Math.max(...grid.map((row) => row.length)),
  );
  const names = columnNames(
    Array.from({ length: width }, (_, index) => grid[0][index] ?? ''),
  );
  const body = grid
    .slice(1)
    .map((row) =>
      Array.from({ length: width }, (_, index) =>
        (row[index] ?? '').trim().slice(0, MAX_CELL_LENGTH),
      ),
    );
  const types: ColumnType[] = names.map((_, index) => {
    const values = body.map((row) => row[index]).filter((value) => value);
    return values.length > 0 &&
      values.every((value) => parseNumber(value) !== null)
      ? 'number'
      : 'text';
  });

  return {
    columns: names.map((name, index) => ({ name, type: types[index] })),
    rows: body.map((row) =>
      row.map((value, index) => {
        if (!value) return null;
        return types[index] === 'number' ? parseNumber(value) : value;
      }),
    ),
  };
}

export function parseDelimited(content: string, delimiter: string): Table[] {
  const table = buildTable(splitDelimited(content, delimiter));
  return table ? [table] : [];
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed
    .split(/(?<!\\)\|/)
    .map((cell) => cell.replaceAll('\\|', '|').trim());
}

const MARKDOWN_SEPARATOR = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

export function parseMarkdownTables(content: string): Table[] {
  const lines = content.split(/\r?\n/);
  const tables: Table[] = [];

  for (let index = 0; index < lines.length - 1; index++) {
    const header = lines[index];

    if (
      !header.includes('|') ||
      !MARKDOWN_SEPARATOR.test(lines[index + 1].trim())
    ) {
      continue;
    }

    const grid = [splitMarkdownRow(header)];
    let next = index + 2;

    while (next < lines.length && lines[next].includes('|')) {
      grid.push(splitMarkdownRow(lines[next]));
      next++;
    }

    const table = buildTable(grid);
    if (table) tables.push(table);
    index = next - 1;
  }

  return tables;
}

function toCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function parseJsonTables(content: string): Table[] {
  let data: unknown;

  try {
    data = JSON.parse(content);
  } catch {
    return [];
  }

  const arrays: [string | null, unknown[]][] = Array.isArray(data)
    ? [[null, data]]
    : typeof data === 'object' && data !== null
      ? Object.entries(data).filter((entry): entry is [string, unknown[]] =>
          Array.isArray(entry[1]),
        )
      : [];

  return arrays.flatMap(([, items]) => {
    const records = items.filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null && !Array.isArray(item),
    );

    if (records.length === 0) {
      return [];
    }

    const keys = [...new Set(records.flatMap((record) => Object.keys(record)))];
    const table = buildTable([
      keys,
      ...records.map((record) => keys.map((key) => toCell(record[key]))),
    ]);
    return table ? [table] : [];
  });
}

export function extractTables(fileName: string, content: string): Table[] {
  const name = fileName.toLowerCase();

  if (name.endsWith('.json')) {
    return parseJsonTables(content);
  }

  if (name.endsWith('.csv') || name.endsWith('.tsv')) {
    const delimiter =
      detectDelimiter(content) ?? (name.endsWith('.tsv') ? '\t' : ',');
    return parseDelimited(content, delimiter);
  }

  const markdown = parseMarkdownTables(content);

  if (markdown.length > 0) {
    return markdown;
  }

  const delimiter = detectDelimiter(content);
  return delimiter && delimiter !== '|'
    ? parseDelimited(content, delimiter)
    : [];
}
