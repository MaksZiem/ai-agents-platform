import type { ComponentProps } from "react";

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={`rounded-md border border-border-strong bg-bg px-2.5 py-2 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger ${className}`}
      {...props}
    />
  );
}
