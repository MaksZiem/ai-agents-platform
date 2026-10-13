import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mb-6 mt-1 text-fg-muted">
          Use your Agent Platform account.
        </p>
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        No account yet?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
