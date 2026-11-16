"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  emailError,
  hasErrors,
  newPasswordError,
  PASSWORD_MAX,
  PASSWORD_MIN,
  type AuthErrorKey,
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
  const t = await getTranslations();
  const message = (key: AuthErrorKey | undefined) =>
    key
      ? t(`auth.errors.${key}`, {
          min: PASSWORD_MIN,
          max: key === "nameTooLong" ? NAME_MAX : PASSWORD_MAX,
        })
      : undefined;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const entered = { name, email };
  const errors = {
    name: message(!name ? "nameRequired" : name.length > NAME_MAX ? "nameTooLong" : undefined),
    email: message(emailError(email)),
    password: message(newPasswordError(password)),
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
        errors: { email: t("auth.errors.emailTaken") },
        formError: null,
      };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, errors: {}, formError: t("errors.validation") };
    }
    return { ...entered, errors: {}, formError: t("errors.unreachable") };
  }

  redirect("/");
}
