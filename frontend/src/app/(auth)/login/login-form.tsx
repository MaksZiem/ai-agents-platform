"use client";

import { useActionState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = { error: null, email: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium">Email</span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium">Password</span>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
