import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const t = await getTranslations("meta");

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-4 rounded bg-accent" aria-hidden />
            <span className="font-semibold">{t("title")}</span>
          </div>
          <LocaleSwitcher />
        </div>
        {children}
      </div>
    </div>
  );
}
