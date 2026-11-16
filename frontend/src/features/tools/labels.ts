import { useMessages, useTranslations } from "next-intl";
import {
  ASK_USER_TOOL,
  type Tool,
  type ToolCategory,
  type ToolPermission,
} from "@/features/tools/types";

export const TOOL_CATEGORIES: ToolCategory[] = [
  "documents",
  "analysis",
  "web",
  "communication",
];

export function groupToolsByCategory(tools: Tool[]) {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);
}

type CatalogEntry = { summary: string; description: string };

export function useToolLabels() {
  const t = useTranslations("tools");
  const catalog: Record<string, CatalogEntry | undefined> = useMessages().tools.catalog;

  function permission(value: ToolPermission | null) {
    if (!value) return t("noPermission");
    return t("permission", {
      resource: t(`resources.${value.resource}`),
      action: t(`actions.${value.action}`),
    });
  }

  return {
    category: (category: ToolCategory) => t(`categories.${category}.label`),
    categoryDescription: (category: ToolCategory) =>
      t(`categories.${category}.description`),
    permission,
    alwaysPauses: (toolName: string) =>
      toolName === ASK_USER_TOOL ? t("waitsForAnswer") : t("alwaysApproval"),
    summary: (tool: { name: string; summary: string }) =>
      catalog[tool.name]?.summary ?? tool.summary,
    description: (tool: { name: string; description: string }) =>
      catalog[tool.name]?.description ?? tool.description,
  };
}
