import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";

export async function NotFoundMessage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-mono text-xs text-fg-muted">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("errors.notFoundTitle")}</h1>
      <p className="max-w-sm text-fg-muted">{t("errors.notFoundDescription")}</p>
      <Link href="/" className={buttonClasses("secondary")}>
        {t("common.backToDashboard")}
      </Link>
    </div>
  );
}
