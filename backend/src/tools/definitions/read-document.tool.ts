import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const MAX_DOCUMENTS_PER_READ = 3;

export const readDocumentTool = defineTool({
  name: 'readDocument',
  summary: "Reads the full text of the agent's documents.",
  category: 'documents',
  description: `Returns the full text of documents in the agent's knowledge base (files uploaded by the user and attached to this agent). Without documentId it returns the first ${MAX_DOCUMENTS_PER_READ} attached documents and lists the rest in notIncluded; read those one at a time with their documentId, and only the ones you need. Use it when you need all the data from a file, e.g. a financial table. If it returns no documents, none are attached to this agent: tell the user instead of guessing. Very long documents are cut off and marked as truncated.`,
  inputSchema: z.object({
    documentId: z.uuid().optional(),
  }),
  outputSchema: z.object({
    documents: z.array(
      z.object({
        documentId: z.string(),
        documentName: z.string(),
        content: z.string(),
        truncated: z.boolean(),
      }),
    ),
    count: z.number().int(),
    notIncluded: z.array(
      z.object({ documentId: z.string(), documentName: z.string() }),
    ),
  }),
  permission: { resource: 'documents', action: 'read' },
  requiresApproval: false,
  execute: async ({ documentId }, context) => {
    if (documentId) {
      const documents = await context.readDocuments(documentId);
      return { documents, count: documents.length, notIncluded: [] };
    }

    const attached = await context.listDocuments();
    const selected = attached.slice(0, MAX_DOCUMENTS_PER_READ);
    const documents = (
      await Promise.all(
        selected.map((document) => context.readDocuments(document.documentId)),
      )
    ).flat();

    return {
      documents,
      count: documents.length,
      notIncluded: attached.slice(MAX_DOCUMENTS_PER_READ),
    };
  },
});
