export type ToolResource = "financial_data" | "documents" | "reports" | "email";

export type ToolAction = "read" | "search" | "modify" | "delete" | "create" | "send";

export type ToolPermission = {
  resource: ToolResource;
  action: ToolAction;
};

export type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  permission: ToolPermission;
  requiresApproval: boolean;
};
