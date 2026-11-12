import {
  ASK_USER_TOOL,
  type Tool,
  type ToolAction,
  type ToolCategory,
  type ToolPermission,
  type ToolResource,
} from "@/features/tools/types";

export const TOOL_CATEGORIES: {
  category: ToolCategory;
  label: string;
  description: string;
}[] = [
  {
    category: "documents",
    label: "Documents",
    description: "Read, search and compare the files in the agent's knowledge base.",
  },
  {
    category: "analysis",
    label: "Analysis & reports",
    description: "Exact calculations and reports the agent saves to Files.",
  },
  {
    category: "web",
    label: "Web & APIs",
    description: "Search the internet, read pages and call your connected APIs.",
  },
  {
    category: "communication",
    label: "Communication",
    description: "Reach people outside the run: email, or a question for you.",
  },
];

export function groupToolsByCategory(tools: Tool[]) {
  return TOOL_CATEGORIES.map((group) => ({
    ...group,
    tools: tools.filter((tool) => tool.category === group.category),
  })).filter((group) => group.tools.length > 0);
}

export const RESOURCE_LABELS: Record<ToolResource, string> = {
  financial_data: "Financial data",
  documents: "Documents",
  reports: "Reports",
  email: "Email",
  web: "Web",
  connections: "Connections",
};

export const ACTION_LABELS: Record<ToolAction, string> = {
  read: "Read",
  search: "Search",
  modify: "Modify",
  delete: "Delete",
  create: "Create",
  send: "Send",
};

export function permissionLabel(permission: ToolPermission | null) {
  if (!permission) return "No permission needed";
  return `${RESOURCE_LABELS[permission.resource]} · ${ACTION_LABELS[permission.action]}`;
}

export function alwaysPausesLabel(toolName: string) {
  return toolName === ASK_USER_TOOL
    ? "Waits for your answer"
    : "Always requires approval";
}
