import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import type { AgentView } from "@/features/agents/types";

const VIEWS: { view: AgentView; label: string; icon: typeof List; href: string }[] = [
  { view: "grid", label: "Tiles", icon: LayoutGrid, href: "/agents" },
  { view: "list", label: "List", icon: List, href: "/agents?view=list" },
];

export function AgentViewToggle({ active }: { active: AgentView }) {
  return (
    <nav
      aria-label="View"
      className="flex items-center rounded-md border border-border bg-surface p-0.5"
    >
      {VIEWS.map(({ view, label, icon: Icon, href }) => {
        const isActive = view === active;

        return (
          <Link
            key={view}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            title={label}
            className={`flex size-7 items-center justify-center rounded transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
