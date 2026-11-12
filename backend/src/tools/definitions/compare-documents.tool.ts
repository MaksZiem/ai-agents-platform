import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { diffDocuments } from '../document-diff.js';
import { defineTool } from '../tool-definition.js';

const DEFAULT_MAX_CHANGES = 50;

const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  truncated: z.boolean(),
});

export const compareDocumentsTool = defineTool({
  name: 'compareDocuments',
  summary: 'Shows what changed between two versions of a document.',
  category: 'documents',
  description:
    'Compares two documents attached to this agent line by line, e.g. two versions of a contract, policy or price list. Returns a similarity score (0-1), counts of unchanged, added and removed lines, and the list of changes with line numbers: "changed" (before → after), "added" (only in B) and "removed" (only in A). Whitespace differences and blank lines are ignored. Document A is the old version, B the new one. Get document ids from readDocument or searchDocuments.',
  inputSchema: z.object({
    documentIdA: z.uuid(),
    documentIdB: z.uuid(),
    maxChanges: z.number().int().min(1).max(200).optional(),
  }),
  outputSchema: z.object({
    documentA: documentSchema,
    documentB: documentSchema,
    identical: z.boolean(),
    similarity: z.number().min(0).max(1),
    stats: z.object({
      linesA: z.number().int(),
      linesB: z.number().int(),
      unchanged: z.number().int(),
      added: z.number().int(),
      removed: z.number().int(),
    }),
    changes: z.array(
      z.object({
        type: z.enum(['added', 'removed', 'changed']),
        lineA: z.number().int().optional(),
        lineB: z.number().int().optional(),
        before: z.string().optional(),
        after: z.string().optional(),
      }),
    ),
    changeCount: z.number().int(),
    truncated: z.boolean(),
  }),
  permission: { resource: 'documents', action: 'read' },
  requiresApproval: false,
  execute: async (
    { documentIdA, documentIdB, maxChanges = DEFAULT_MAX_CHANGES },
    context,
  ) => {
    if (documentIdA === documentIdB) {
      throw new BadRequestException('documentIdA and documentIdB are the same');
    }

    const [[documentA], [documentB]] = await Promise.all([
      context.readDocuments(documentIdA),
      context.readDocuments(documentIdB),
    ]);
    if (!documentA || !documentB) {
      const missing = [
        ...(documentA ? [] : [documentIdA]),
        ...(documentB ? [] : [documentIdB]),
      ];
      throw new BadRequestException(
        `Not attached to this agent: ${missing.join(', ')}`,
      );
    }

    const diff = diffDocuments(documentA.content, documentB.content);

    return {
      documentA: {
        id: documentA.documentId,
        name: documentA.documentName,
        truncated: documentA.truncated,
      },
      documentB: {
        id: documentB.documentId,
        name: documentB.documentName,
        truncated: documentB.truncated,
      },
      identical: diff.identical,
      similarity: diff.similarity,
      stats: diff.stats,
      changes: diff.changes.slice(0, maxChanges),
      changeCount: diff.changes.length,
      truncated: diff.changes.length > maxChanges,
    };
  },
});
