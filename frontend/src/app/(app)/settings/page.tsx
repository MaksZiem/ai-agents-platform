import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PageHeader } from "@/components/ui/page-header";
import { PASSWORD_MIN } from "@/features/auth/validation";
import { apiFetch } from "@/lib/api";
import { ChangePasswordForm } from "./change-password-form";
import type { User } from "@/features/auth/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

const CARD_CLASSES =
  "flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]";

export default async function SettingsPage() {
  const [user, t] = await Promise.all([
    apiFetch<User>("/auth/me"),
    getTranslations("settings"),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} description={t("lead")} />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-6">
        <section className={CARD_CLASSES}>
          <h2 className="text-base font-semibold">{t("account")}</h2>
          <dl className="grid grid-cols-[140px_1fr] items-center gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-fg-muted">{t("name")}</dt>
            <dd>{user.name}</dd>
            <dt className="text-fg-muted">{t("email")}</dt>
            <dd className="font-mono">{user.email}</dd>
            <dt className="text-fg-muted">{t("language")}</dt>
            <dd>
              <LocaleSwitcher />
            </dd>
          </dl>
        </section>

        <section className={CARD_CLASSES}>
          <div>
            <h2 className="text-base font-semibold">{t("password.title")}</h2>
            <p className="text-[13px] text-fg-muted">
              {t("password.lead", { min: PASSWORD_MIN })}
            </p>
          </div>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
