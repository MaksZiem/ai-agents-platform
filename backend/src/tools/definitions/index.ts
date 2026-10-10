import type { ToolDefinition } from '../tool-definition.js';
import { analyzeTransactionsTool } from './analyze-transactions.tool.js';
import { comparePeriodsTool } from './compare-periods.tool.js';
import { generateReportTool } from './generate-report.tool.js';
import { getTransactionsTool } from './get-transactions.tool.js';
import { searchDocumentsTool } from './search-documents.tool.js';
import { sendEmailTool } from './send-email.tool.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  getTransactionsTool,
  analyzeTransactionsTool,
  comparePeriodsTool,
  generateReportTool,
  searchDocumentsTool,
  sendEmailTool,
];
