import type { ToolAction, ToolResource } from "@/lib/types";

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

export type SchemaField = {
  name: string;
  type: string;
  required: boolean;
};

function describeType(schema: unknown): string {
  if (typeof schema !== "object" || schema === null) return "unknown";
  const field = schema as Record<string, unknown>;

  if (typeof field.format === "string") return field.format;
  if (field.type === "array") return `${describeType(field.items)}[]`;
  if (Array.isArray(field.enum)) return field.enum.map(String).join(" | ");
  if (typeof field.type === "string") return field.type;
  if (Array.isArray(field.anyOf)) return field.anyOf.map(describeType).join(" | ");
  return "unknown";
}

export function getSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  const { properties, required } = schema;
  if (typeof properties !== "object" || properties === null) return [];

  const requiredNames = Array.isArray(required) ? required : [];

  return Object.entries(properties).map(([name, field]) => ({
    name,
    type: describeType(field),
    required: requiredNames.includes(name),
  }));
}

