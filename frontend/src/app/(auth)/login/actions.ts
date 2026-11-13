"use server";

import { redirect } from "next/navigation";
import { emailError, hasErrors } from "@/features/auth/validation";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/features/auth/types";

export type LoginState = {
  email: string;
  errors: { email?: string; password?: string };
  formError: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = {
    email: emailError(email),
    password: password ? undefined : "Enter your password.",
  };

  if (hasErrors(errors)) {
    return { email, errors, formError: null };
  }

  try {
    const { accessToken } = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setAccessToken(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { email, errors: {}, formError: "Invalid email or password." };
    }
    return {
      email,
      errors: {},
      formError: "Could not reach the server. Try again.",
    };
  }

  redirect("/");
}
