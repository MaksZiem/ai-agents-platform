import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

const DEFAULT_LIMIT = 5;

export const searchDocumentsTool = defineTool({
  name: 'searchDocuments',
  description:
    "Searches the agent's knowledge base (documents attached to this agent) by keywords. Returns the most relevant text fragments with the name of the document they come from.",
  inputSchema: z.object({
    query: z.string().min(1).max(500),
    limit: z.number().int().min(1).max(10).optional(),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        documentId: z.string(),
        documentName: z.string(),
        position: z.number().int(),
        content: z.string(),
        score: z.number(),
      }),
    ),
    count: z.number().int(),
  }),
  permission: { resource: 'documents', action: 'search' },
  requiresApproval: false,
  execute: async ({ query, limit = DEFAULT_LIMIT }, context) => {
    const results = await context.searchDocuments(query, limit);
    return { results, count: results.length };
  },
});
