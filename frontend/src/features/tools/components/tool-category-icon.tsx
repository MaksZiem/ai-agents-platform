import { Calculator, FileText, Globe, MessageSquare, type LucideIcon } from "lucide-react";
import type { ToolCategory } from "@/features/tools/types";

const ICONS: Record<ToolCategory, LucideIcon> = {
  documents: FileText,
  analysis: Calculator,
  web: Globe,
  communication: MessageSquare,
};

export function ToolCategoryIcon({
  category,
  className = "size-4",
}: {
  category: ToolCategory;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon className={`shrink-0 text-fg-muted ${className}`} strokeWidth={1.75} aria-hidden />;
}
