"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = { email: "", errors: {}, formError: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);
  const { errors } = state;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField label="Email" error={errors.email}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>

      <FormField label="Password" error={errors.password}>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
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

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
