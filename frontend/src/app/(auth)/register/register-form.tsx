"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/input";
import { SubmitButton } from "@/components/submit-button";
import { register, type RegisterState } from "./actions";

const INITIAL_STATE: RegisterState = { error: null, name: "", email: "" };

export function RegisterForm() {
  const [state, formAction] = useActionState(register, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Name">
        <Input
          name="name"
          autoComplete="name"
          maxLength={100}
          defaultValue={state.name}
          required
        />
      </FormField>
      <FormField label="Email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
      </FormField>
      <FormField label="Password" hint="At least 8 characters.">
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton variant="primary" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
