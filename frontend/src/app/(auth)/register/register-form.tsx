"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { PASSWORD_MIN } from "@/features/auth/validation";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { register, type RegisterState } from "./actions";

const INITIAL_STATE: RegisterState = {
  name: "",
  email: "",
  errors: {},
  formError: null,
};

export function RegisterForm() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(register, INITIAL_STATE);
  const { errors } = state;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField label={t("fields.name")} error={errors.name}>
        <Input
          name="name"
          autoComplete="name"
          defaultValue={state.name}
          aria-invalid={Boolean(errors.name)}
        />
      </FormField>
      <FormField label={t("fields.email")} error={errors.email}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>
      <FormField
        label={t("fields.password")}
        hint={t("fields.passwordHint", { min: PASSWORD_MIN })}
        error={errors.password}
      >
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
        />
      </FormField>

      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger"
        >
          {state.formError}
        </p>
      )}

      <SubmitButton variant="primary" pendingLabel={t("signUp.pending")}>
        {t("signUp.submit")}
      </SubmitButton>
    </form>
  );
}
