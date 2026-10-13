import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { Approval, User } from "@/lib/types";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const [user, pendingApprovals] = await Promise.all([
    apiFetch<User>("/auth/me"),
    apiFetch<Approval[]>("/approvals?status=PENDING"),
  ]);

  return (
    <div className="flex h-full">
      <Sidebar user={user} pendingApprovals={pendingApprovals.length} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
