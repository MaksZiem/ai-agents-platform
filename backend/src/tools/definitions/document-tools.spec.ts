import type { DocumentText } from '../../knowledge/knowledge-search.js';
import type { ToolContext } from '../tool-definition.js';
import { diffDocuments } from '../document-diff.js';
import { askUserTool } from './ask-user.tool.js';
import { compareDocumentsTool } from './compare-documents.tool.js';
import { extractTableTool } from './extract-table.tool.js';

const ID_A = '6f1c4f4e-2a7b-4c1e-9d55-0d5f1b0e6a01';
const ID_B = '6f1c4f4e-2a7b-4c1e-9d55-0d5f1b0e6a02';
const ID_MISSING = '6f1c4f4e-2a7b-4c1e-9d55-0d5f1b0e6a03';

function contextWith(
  documents: DocumentText[],
  userAnswer: string | null = null,
) {
  return {
    readDocuments: async (documentId?: string) =>
      documents.filter((document) => document.documentId === documentId),
    userAnswer,
  } as unknown as ToolContext;
}

function document(id: string, name: string, content: string): DocumentText {
  return { documentId: id, documentName: name, content, truncated: false };
}

describe('diffDocuments', () => {
  it('reports changed, added and removed lines with line numbers', () => {
    const diff = diffDocuments(
      'Title\nPrice: 100\nTerm: 12 months\nOld clause',
      'Title\n\nPrice: 120\nTerm:   12 months\nNew clause\nExtra',
    );

    expect(diff.identical).toBe(false);
    expect(diff.stats).toEqual({
      linesA: 4,
      linesB: 5,
      unchanged: 2,
      added: 3,
      removed: 2,
    });
    expect(diff.changes).toEqual([
      {
        type: 'changed',
        lineA: 2,
        lineB: 3,
        before: 'Price: 100',
        after: 'Price: 120',
      },
      {
        type: 'changed',
        lineA: 4,
        lineB: 5,
        before: 'Old clause',
        after: 'New clause\nExtra',
      },
    ]);
    expect(diff.similarity).toBeCloseTo(0.444, 3);
  });

  it('treats whitespace-only differences as identical', () => {
    const diff = diffDocuments('a  b\n\nc', ' a b\nc ');

    expect(diff.identical).toBe(true);
    expect(diff.similarity).toBe(1);
  });

  it('reports pure additions and removals', () => {
    expect(diffDocuments('a\nb', 'a\nb\nc').changes).toEqual([
      { type: 'added', lineB: 3, after: 'c' },
    ]);
    expect(diffDocuments('a\nb\nc', 'b\nc').changes).toEqual([
      { type: 'removed', lineA: 1, before: 'a' },
    ]);
  });
});

describe('compareDocuments tool', () => {
  const context = contextWith([
    document(ID_A, 'v1.md', 'a\nb\nc\nd'),
    document(ID_B, 'v2.md', 'a\nB\nc\nD'),
  ]);

  it('compares two attached documents and limits the changes', async () => {
    const result = await compareDocumentsTool.execute(
      { documentIdA: ID_A, documentIdB: ID_B, maxChanges: 1 },
      context,
    );

    expect(result.documentA.name).toBe('v1.md');
    expect(result.changeCount).toBe(2);
    expect(result.changes).toHaveLength(1);
    expect(result.truncated).toBe(true);
    expect(compareDocumentsTool.outputSchema.safeParse(result).success).toBe(
      true,
    );
  });

  it('rejects comparing a document with itself', async () => {
    await expect(
      compareDocumentsTool.execute(
        { documentIdA: ID_A, documentIdB: ID_A },
        context,
      ),
    ).rejects.toThrow('are the same');
  });

  it('names documents that are not attached', async () => {
    await expect(
      compareDocumentsTool.execute(
        { documentIdA: ID_A, documentIdB: ID_MISSING },
        context,
      ),
    ).rejects.toThrow(ID_MISSING);
  });
});

describe('extractTable tool', () => {
  const context = contextWith([
    document(ID_A, 'costs.csv', 'item,cost\nrent,2000\nads,500\ntools,120'),
    document(ID_B, 'notes.md', 'No tables here.'),
  ]);

  it('returns tables with a row limit', async () => {
    const result = await extractTableTool.execute(
      { documentId: ID_A, maxRows: 2 },
      context,
    );

    expect(result.tableCount).toBe(1);
    expect(result.tables[0]).toMatchObject({
      index: 0,
      rows: [
        ['rent', 2000],
        ['ads', 500],
      ],
      rowCount: 3,
      truncated: true,
    });
    expect(extractTableTool.outputSchema.safeParse(result).success).toBe(true);
  });

  it('rejects an out-of-range tableIndex', async () => {
    await expect(
      extractTableTool.execute({ documentId: ID_B, tableIndex: 0 }, context),
    ).rejects.toThrow('No tables found in notes.md');
  });

  it('rejects a document that is not attached', async () => {
    await expect(
      extractTableTool.execute({ documentId: ID_MISSING }, context),
    ).rejects.toThrow('not attached');
  });
});

describe('askUser tool', () => {
  it('returns the answer given by the user', async () => {
    const result = await askUserTool.execute(
      { question: 'Which quarter?' },
      contextWith([], 'Q3'),
    );

    expect(result).toEqual({ question: 'Which quarter?', answer: 'Q3' });
  });

  it('fails without an answer', async () => {
    await expect(
      askUserTool.execute({ question: 'Which quarter?' }, contextWith([])),
    ).rejects.toThrow('has not answered');
  });

  it('always pauses for the user and needs no permission', () => {
    expect(askUserTool.requiresApproval).toBe(true);
    expect(askUserTool.permission).toBeNull();
  });
});
