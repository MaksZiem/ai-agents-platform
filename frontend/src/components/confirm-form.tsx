"use client";

import { ReactNode } from "react";

type ConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
};

export function ConfirmForm({
  action,
  message,
  children,
  className,
}: ConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
