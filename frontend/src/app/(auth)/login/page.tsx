import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="size-4 rounded bg-accent" aria-hidden />
          <span className="font-semibold">Agent Platform</span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mb-6 mt-1 text-fg-muted">Use your Agent Platform account.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
