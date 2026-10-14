import type { ToolAction, ToolResource } from "@/features/tools/types";

export const RESOURCE_LABELS: Record<ToolResource, string> = {
  financial_data: "Financial data",
  documents: "Documents",
  reports: "Reports",
  email: "Email",
};

export const ACTION_LABELS: Record<ToolAction, string> = {
  read: "Read",
  search: "Search",
  modify: "Modify",
  delete: "Delete",
  create: "Create",
  send: "Send",
};
