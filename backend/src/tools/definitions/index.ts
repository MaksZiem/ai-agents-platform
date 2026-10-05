import type { ToolDefinition } from '../tool-definition.js';
import { getTransactionsTool } from './get-transactions.tool.js';
import { sendEmailTool } from './send-email.tool.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  getTransactionsTool,
  sendEmailTool,
];
