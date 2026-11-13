"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePassword, type ChangePasswordState } from "./actions";

const INITIAL_STATE: ChangePasswordState = {
  errors: {},
  formError: null,
  success: false,
};

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, INITIAL_STATE);
  const { errors } = state;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField label="Current password" error={errors.currentPassword}>
        <Input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
        />
      </FormField>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          label="New password"
          hint="At least 8 characters."
          error={errors.newPassword}
        >
          <Input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
          />
        </FormField>
        <FormField label="Confirm new password" error={errors.confirmPassword}>
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </FormField>
      </div>

      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger"
        >
          {state.formError}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-xs text-success">
          Password changed.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton variant="primary" pendingLabel="Saving…">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}
