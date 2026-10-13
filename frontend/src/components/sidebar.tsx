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
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";
import type { User } from "@/lib/types";

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

type SidebarProps = {
  user: User;
  pendingApprovals: number;
};

export function Sidebar({ user, pendingApprovals }: SidebarProps) {
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
          const count = href === "/approvals" ? pendingApprovals : 0;

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
              {count > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 font-mono text-[11px] text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-border px-2.5 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{user.name}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            className="flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
          >
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
    </aside>
  );
}
