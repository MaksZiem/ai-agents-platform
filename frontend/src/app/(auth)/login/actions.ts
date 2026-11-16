"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  emailError,
  hasErrors,
  PASSWORD_MAX,
  PASSWORD_MIN,
  type AuthErrorKey,
} from "@/features/auth/validation";
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
  const t = await getTranslations();
  const message = (key: AuthErrorKey | undefined) =>
    key ? t(`auth.errors.${key}`, { min: PASSWORD_MIN, max: PASSWORD_MAX }) : undefined;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = {
    email: message(emailError(email)),
    password: message(password ? undefined : "passwordRequired"),
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
      return { email, errors: {}, formError: t("auth.errors.invalidCredentials") };
    }
    return { email, errors: {}, formError: t("errors.unreachable") };
  }

  redirect("/");
}
