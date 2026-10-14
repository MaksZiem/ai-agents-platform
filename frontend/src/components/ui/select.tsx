import type { ComponentProps } from "react";

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`h-[34px] rounded-md border border-border-strong bg-bg px-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger ${className}`}
      {...props}
    />
  );
}
