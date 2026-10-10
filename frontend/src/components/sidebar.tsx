"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ListChecks,
  BookOpen,
  Wrench,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/executions", label: "Executions", icon: ListChecks },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface px-2.5 py-4">
      <div className="flex items-center gap-2 px-2.5 pb-5">
        <span className="size-4 rounded bg-accent" aria-hidden />
        <span className="font-semibold">Agent Platform</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active
                  ? "bg-surface-2 text-fg"
                  : "text-fg-muted hover:bg-surface-hover hover:text-fg"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
