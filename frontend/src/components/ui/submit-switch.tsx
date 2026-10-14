"use client";

import { useFormStatus } from "react-dom";

type SubmitSwitchProps = {
  checked: boolean;
  label: string;
};

export function SubmitSwitch({ checked, label }: SubmitSwitchProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={pending}
      className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-50 ${
        checked ? "border-accent bg-accent" : "border-border-strong bg-surface-2"
      }`}
    >
      <span
        className={`size-3 rounded-full bg-white transition-transform motion-reduce:transition-none ${
          checked ? "translate-x-[15px]" : "translate-x-[2px]"
        }`}
        aria-hidden
      />
    </button>
  );
}
