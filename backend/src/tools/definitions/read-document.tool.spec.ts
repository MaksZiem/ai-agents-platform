import type { ToolContext } from '../tool-definition.js';
import {
  MAX_DOCUMENTS_PER_READ,
  readDocumentTool,
} from './read-document.tool.js';

const attached = Array.from({ length: 5 }, (_, index) => ({
  documentId: `doc-${index}`,
  documentName: `file-${index}.md`,
}));

const context = {
  listDocuments: async () => attached,
  readDocuments: async (documentId?: string) =>
    attached
      .filter((document) => document.documentId === documentId)
      .map((document) => ({ ...document, content: 'text', truncated: false })),
} as unknown as ToolContext;

describe('readDocument tool', () => {
  it('reads at most a few documents and lists the rest', async () => {
    const result = await readDocumentTool.execute({}, context);

    expect(result.count).toBe(MAX_DOCUMENTS_PER_READ);
    expect(result.documents.map((document) => document.documentId)).toEqual([
      'doc-0',
      'doc-1',
      'doc-2',
    ]);
    expect(result.notIncluded).toEqual(attached.slice(MAX_DOCUMENTS_PER_READ));
    expect(readDocumentTool.outputSchema.safeParse(result).success).toBe(true);
  });

  it('reads one document by id', async () => {
    const result = await readDocumentTool.execute(
      { documentId: '6f1c4f4e-2a7b-4c1e-9d55-0d5f1b0e6a01' },
      {
        ...context,
        readDocuments: async () => [
          {
            documentId: 'x',
            documentName: 'x.md',
            content: 'text',
            truncated: false,
          },
        ],
      } as ToolContext,
    );

    expect(result.count).toBe(1);
    expect(result.notIncluded).toEqual([]);
  });
});
