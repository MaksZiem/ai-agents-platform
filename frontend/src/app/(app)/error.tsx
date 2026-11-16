"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{t("errors.title")}</h1>
      <p className="max-w-sm text-fg-muted">{t("errors.description")}</p>
      {error.digest && (
        <p className="font-mono text-xs text-fg-muted">
          {t("errors.errorId", { id: error.digest })}
        </p>
      )}
      <Button variant="primary" onClick={retry}>
        {t("common.retry")}
      </Button>
    </div>
  );
}
