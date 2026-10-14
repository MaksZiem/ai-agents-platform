import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`h-[34px] rounded-md border border-border-strong bg-bg px-2.5 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger ${className}`}
      {...props}
    />
  );
}
