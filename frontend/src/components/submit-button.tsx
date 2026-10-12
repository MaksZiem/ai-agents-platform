"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
