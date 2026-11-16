"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { PASSWORD_MIN } from "@/features/auth/validation";
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
  const t = useTranslations("settings.password");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(changePassword, INITIAL_STATE);
  const { errors } = state;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField label={t("current")} error={errors.currentPassword}>
        <Input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
        />
      </FormField>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          label={t("new")}
          hint={t("newHint", { min: PASSWORD_MIN })}
          error={errors.newPassword}
        >
          <Input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
          />
        </FormField>
        <FormField label={t("confirm")} error={errors.confirmPassword}>
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
          {t("changed")}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton variant="primary" pendingLabel={tCommon("saving")}>
          {t("submit")}
        </SubmitButton>
      </div>
    </form>
  );
}
