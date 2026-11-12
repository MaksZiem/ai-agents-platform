import {
  ASK_USER_TOOL,
  type ToolAction,
  type ToolPermission,
  type ToolResource,
} from "@/features/tools/types";

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
