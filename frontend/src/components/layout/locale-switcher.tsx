"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`inline-flex rounded-md border border-border p-0.5 text-xs ${pending ? "opacity-60" : ""} ${className}`}
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            title={t(`languages.${locale}`)}
            disabled={pending}
            onClick={() => !active && startTransition(() => setLocale(locale))}
            className={`min-w-8 rounded px-2 py-0.5 font-medium uppercase transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              active ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
