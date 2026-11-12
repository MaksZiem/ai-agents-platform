import {
  detectDelimiter,
  extractTables,
  parseMarkdownTables,
  parseNumber,
} from './tables.js';

describe('parseNumber', () => {
  it.each([
    ['42', 42],
    ['-3.5', -3.5],
    ['1,234.56', 1234.56],
    ['1.234,56', 1234.56],
    ['1 234,56', 1234.56],
    ['12,5', 12.5],
    ['1,000,000', 1000000],
    ['1.000.000', 1000000],
    ['$1,200', 1200],
    ['-$1,200', -1200],
    ['(450)', -450],
    ['99 zł', 99],
    ['12%', 12],
    ['€ 3,5', 3.5],
  ])('%s → %d', (raw, expected) => {
    expect(parseNumber(raw)).toBe(expected);
  });

  it.each(['', 'Q1', '2026-01-01', 'abc', '1.2.3a', '12 apples'])(
    'rejects %s',
    (raw) => {
      expect(parseNumber(raw)).toBeNull();
    },
  );
});

describe('detectDelimiter', () => {
  it('picks the delimiter that splits every line the same way', () => {
    expect(detectDelimiter('a;b;c\n1;2,5;3\n4;5;6')).toBe(';');
    expect(detectDelimiter('a\tb\n1\t2')).toBe('\t');
  });

  it('ignores delimiters inside quotes', () => {
    expect(detectDelimiter('name,note\n"Smith, J",ok\nDoe,"a, b"')).toBe(',');
  });

  it('returns null for prose', () => {
    expect(detectDelimiter('Hello there.\nThis is, well, text')).toBeNull();
  });
});

describe('extractTables', () => {
  it('parses a CSV with quotes and numeric columns', () => {
    const [table] = extractTables(
      'sales.csv',
      'month,region,revenue\nJan,"North, East","1,200.50"\nFeb,South,900\n',
    );

    expect(table.columns).toEqual([
      { name: 'month', type: 'text' },
      { name: 'region', type: 'text' },
      { name: 'revenue', type: 'number' },
    ]);
    expect(table.rows).toEqual([
      ['Jan', 'North, East', 1200.5],
      ['Feb', 'South', 900],
    ]);
  });

  it('pads short rows and names empty headers', () => {
    const [table] = extractTables('a.csv', 'a,,a\n1,2,3\n4');

    expect(table.columns.map((column) => column.name)).toEqual([
      'a',
      'column_2',
      'a_2',
    ]);
    expect(table.rows[1]).toEqual([4, null, null]);
  });

  it('finds every Markdown table in a document', () => {
    const tables = parseMarkdownTables(
      [
        '# Report',
        '| Item | Cost |',
        '|------|-----:|',
        '| Rent | 2 000 |',
        '| Ads \\| SEO | 500 |',
        '',
        'Text between.',
        '',
        'Q | Value',
        '--- | ---',
        'Q1 | 10',
      ].join('\n'),
    );

    expect(tables).toHaveLength(2);
    expect(tables[0].rows).toEqual([
      ['Rent', 2000],
      ['Ads | SEO', 500],
    ]);
    expect(tables[1].rows).toEqual([['Q1', 10]]);
  });

  it('turns JSON arrays of objects into tables', () => {
    const tables = extractTables(
      'data.json',
      JSON.stringify({
        customers: [
          { name: 'Ann', spend: 10 },
          { name: 'Bob', city: 'Oslo' },
        ],
        meta: { version: 1 },
      }),
    );

    expect(tables).toHaveLength(1);
    expect(tables[0].columns.map((column) => column.name)).toEqual([
      'name',
      'spend',
      'city',
    ]);
    expect(tables[0].rows).toEqual([
      ['Ann', 10, null],
      ['Bob', null, 'Oslo'],
    ]);
  });

  it('detects delimited data in a text file', () => {
    const [table] = extractTables('export.txt', 'id;total\n1;10,5\n2;7');

    expect(table.rows).toEqual([
      [1, 10.5],
      [2, 7],
    ]);
  });

  it('returns no tables for prose', () => {
    expect(
      extractTables('notes.txt', 'Just some notes.\nNothing here.'),
    ).toEqual([]);
  });
});
