import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const readDocumentTool = defineTool({
  name: 'readDocument',
  description:
    "Returns the full text of documents in the agent's knowledge base (files uploaded by the user and attached to this agent). Without documentId it returns every attached document. Use it when you need all the data from a file, e.g. a financial table. If it returns no documents, none are attached to this agent: tell the user instead of guessing. Very long documents are cut off and marked as truncated.",
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
  }),
  permission: { resource: 'documents', action: 'read' },
  requiresApproval: false,
  execute: async ({ documentId }, context) => {
    const documents = await context.readDocuments(documentId);
    return { documents, count: documents.length };
  },
});
