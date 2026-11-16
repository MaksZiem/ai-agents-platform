import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signIn");
  return { title: t("title") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.signIn");

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mb-6 mt-1 text-fg-muted">{t("lead")}</p>
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-accent hover:underline">
          {t("toSignUp")}
        </Link>
      </p>
    </>
  );
}
