export type ToolResource =
  | "financial_data"
  | "documents"
  | "reports"
  | "email"
  | "web"
  | "connections";

export type ToolCategory = "documents" | "analysis" | "web" | "communication";

export type ToolAction = "read" | "search" | "modify" | "delete" | "create" | "send";

export type ToolPermission = {
  resource: ToolResource;
  action: ToolAction;
};

export type Tool = {
  name: string;
  summary: string;
  category: ToolCategory;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  permission: ToolPermission | null;
  requiresApproval: boolean;
};

export const ASK_USER_TOOL = "askUser";
