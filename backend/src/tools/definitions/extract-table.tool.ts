import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { extractTables } from '../tables.js';
import { defineTool } from '../tool-definition.js';

const DEFAULT_MAX_ROWS = 100;
const MAX_TABLES = 10;

const cellSchema = z.union([z.string(), z.number(), z.null()]);

export const extractTableTool = defineTool({
  name: 'extractTable',
  description:
    'Extracts tables from a document attached to this agent as structured rows and columns. Works for CSV/TSV files, JSON arrays of objects and Markdown tables; tables inside PDFs are not detected, use readDocument for those. Numeric columns (also with currency symbols, % or thousand separators) come back as numbers, ready for calculate. Without tableIndex it returns every table found (up to 10). Get document ids from readDocument or searchDocuments.',
  inputSchema: z.object({
    documentId: z.uuid(),
    tableIndex: z.number().int().min(0).max(100).optional(),
    maxRows: z.number().int().min(1).max(500).optional(),
  }),
  outputSchema: z.object({
    documentId: z.string(),
    documentName: z.string(),
    documentTruncated: z.boolean(),
    tableCount: z.number().int(),
    tables: z.array(
      z.object({
        index: z.number().int(),
        columns: z.array(
          z.object({ name: z.string(), type: z.enum(['number', 'text']) }),
        ),
        rows: z.array(z.array(cellSchema)),
        rowCount: z.number().int(),
        truncated: z.boolean(),
      }),
    ),
  }),
  permission: { resource: 'documents', action: 'read' },
  requiresApproval: false,
  execute: async (
    { documentId, tableIndex, maxRows = DEFAULT_MAX_ROWS },
    context,
  ) => {
    const [document] = await context.readDocuments(documentId);

    if (!document) {
      throw new BadRequestException(
        `Document ${documentId} is not attached to this agent`,
      );
    }

    const found = extractTables(document.documentName, document.content);

    if (tableIndex !== undefined && tableIndex >= found.length) {
      throw new BadRequestException(
        found.length === 0
          ? `No tables found in ${document.documentName}`
          : `tableIndex ${tableIndex} is out of range: ${document.documentName} has ${found.length} table(s), indexed from 0`,
      );
    }

    const selected = found
      .map((table, index) => ({ table, index }))
      .filter(({ index }) =>
        tableIndex === undefined ? index < MAX_TABLES : index === tableIndex,
      );

    return {
      documentId: document.documentId,
      documentName: document.documentName,
      documentTruncated: document.truncated,
      tableCount: found.length,
      tables: selected.map(({ table, index }) => ({
        index,
        columns: table.columns,
        rows: table.rows.slice(0, maxRows),
        rowCount: table.rows.length,
        truncated: table.rows.length > maxRows,
      })),
    };
  },
});
