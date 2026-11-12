import type { ToolDefinition } from '../tool-definition.js';
import { askUserTool } from './ask-user.tool.js';
import { calculateTool } from './calculate.tool.js';
import { compareDocumentsTool } from './compare-documents.tool.js';
import { extractTableTool } from './extract-table.tool.js';
import { fetchUrlTool } from './fetch-url.tool.js';
import { generateReportTool } from './generate-report.tool.js';
import { httpRequestTool } from './http-request.tool.js';
import { readDocumentTool } from './read-document.tool.js';
import { searchDocumentsTool } from './search-documents.tool.js';
import { sendEmailTool } from './send-email.tool.js';
import { webSearchTool } from './web-search.tool.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  readDocumentTool,
  searchDocumentsTool,
  extractTableTool,
  compareDocumentsTool,
  webSearchTool,
  fetchUrlTool,
  httpRequestTool,
  calculateTool,
  generateReportTool,
  sendEmailTool,
  askUserTool,
];
