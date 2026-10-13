import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Settings",
};

const CARD_CLASSES =
  "flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]";

export default async function SettingsPage() {
  const user = await apiFetch<User>("/auth/me");

  return (
    <div>
      <PageHeader title="Settings" description="Your account and security." />

      <div className="flex max-w-[720px] flex-col gap-6 p-6">
        <section className={CARD_CLASSES}>
          <h2 className="text-base font-semibold">Account</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-fg-muted">Name</dt>
            <dd>{user.name}</dd>
            <dt className="text-fg-muted">Email</dt>
            <dd className="font-mono">{user.email}</dd>
          </dl>
        </section>

        <section className={CARD_CLASSES}>
          <div>
            <h2 className="text-base font-semibold">Password</h2>
            <p className="text-[13px] text-fg-muted">
              Use at least 8 characters. You stay signed in on this device.
            </p>
          </div>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
