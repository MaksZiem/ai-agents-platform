import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="mb-6 mt-1 text-fg-muted">
          Set up your workspace and build your first agent.
        </p>
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
