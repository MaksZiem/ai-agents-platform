import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="size-4 rounded bg-accent" aria-hidden />
          <span className="font-semibold">Agent Platform</span>
        </div>
        {children}
      </div>
    </div>
  );
}
