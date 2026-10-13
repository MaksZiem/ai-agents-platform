"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/input";
import { SubmitButton } from "@/components/submit-button";
import { changePassword, type ChangePasswordState } from "./actions";

const INITIAL_STATE: ChangePasswordState = { error: null, success: false };

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Current password">
        <Input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="New password" hint="At least 8 characters.">
          <Input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </FormField>
        <FormField label="Confirm new password">
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </FormField>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
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
