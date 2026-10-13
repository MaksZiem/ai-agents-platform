import Link from "next/link";
import { buttonClasses } from "@/components/button";

export function NotFoundMessage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-mono text-xs text-fg-muted">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-fg-muted">
        This page does not exist, or it belongs to another account.
      </p>
      <Link href="/" className={buttonClasses("secondary")}>
        Back to dashboard
      </Link>
    </div>
  );
}
