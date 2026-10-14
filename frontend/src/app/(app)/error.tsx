"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-sm text-fg-muted">
        This page could not be loaded. The backend may be unavailable.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-fg-muted">
          Error ID: {error.digest}
        </p>
      )}
      <Button variant="primary" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
