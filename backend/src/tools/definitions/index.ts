import type { ToolDefinition } from '../tool-definition.js';
import { analyzeTransactionsTool } from './analyze-transactions.tool.js';
import { comparePeriodsTool } from './compare-periods.tool.js';
import { generateReportTool } from './generate-report.tool.js';
import { readDocumentTool } from './read-document.tool.js';
import { searchDocumentsTool } from './search-documents.tool.js';
import { sendEmailTool } from './send-email.tool.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  readDocumentTool,
  searchDocumentsTool,
  comparePeriodsTool,
  analyzeTransactionsTool,
  generateReportTool,
  sendEmailTool,
];
