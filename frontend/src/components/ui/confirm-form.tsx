"use client";

import { useId, useRef, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  children: ReactNode;
  className?: string;
};

export function ConfirmForm({
  action,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  children,
  className,
}: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmed = useRef(false);
  const titleId = useId();
  const messageId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }
    event.preventDefault();
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function confirm() {
    confirmed.current = true;
    close();
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} className={className} onSubmit={handleSubmit}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border-strong bg-surface p-0 text-fg shadow-lg shadow-black/40 backdrop:bg-black/60"
      >
        <div className="flex flex-col gap-5 p-[18px]">
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <p id={messageId} className="text-[13px] leading-relaxed text-fg-muted">
              {message}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close} autoFocus>
              Cancel
            </Button>
            <Button variant={tone} onClick={confirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </form>
  );
}
