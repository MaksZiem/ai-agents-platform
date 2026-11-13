"use server";

import { redirect } from "next/navigation";
import {
  emailError,
  hasErrors,
  newPasswordError,
} from "@/features/auth/validation";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/features/auth/types";

export type RegisterState = {
  name: string;
  email: string;
  errors: { name?: string; email?: string; password?: string };
  formError: string | null;
};

const NAME_MAX = 100;

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const entered = { name, email };
  const errors = {
    name: !name
      ? "Enter your name."
      : name.length > NAME_MAX
        ? `Use at most ${NAME_MAX} characters.`
        : undefined,
    email: emailError(email),
    password: newPasswordError(password),
  };

  if (hasErrors(errors)) {
    return { ...entered, errors, formError: null };
  }

  try {
    const { accessToken } = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });
    await setAccessToken(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return {
        ...entered,
        errors: { email: "An account with this email already exists." },
        formError: null,
      };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, errors: {}, formError: error.message };
    }
    return {
      ...entered,
      errors: {},
      formError: "Could not reach the server. Try again.",
    };
  }

  redirect("/");
}
