"use server";

import { getTranslations } from "next-intl/server";
import {
  hasErrors,
  newPasswordError,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from "@/features/auth/validation";
import { ApiError, apiFetch } from "@/lib/api";

export type ChangePasswordState = {
  errors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  formError: string | null;
  success: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const t = await getTranslations();
  const tPassword = await getTranslations("settings.password.errors");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const newPasswordKey = newPasswordError(newPassword);
  const errors = {
    currentPassword: currentPassword ? undefined : tPassword("currentRequired"),
    newPassword: newPasswordKey
      ? t(`auth.errors.${newPasswordKey}`, { min: PASSWORD_MIN, max: PASSWORD_MAX })
      : newPassword === currentPassword
        ? tPassword("sameAsCurrent")
        : undefined,
    confirmPassword: !confirmPassword
      ? tPassword("confirmRequired")
      : confirmPassword !== newPassword
        ? tPassword("mismatch")
        : undefined,
  };

  if (hasErrors(errors)) {
    return { errors, formError: null, success: false };
  }

  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const formError =
        error.code === "CURRENT_PASSWORD_INCORRECT"
          ? tPassword("CURRENT_PASSWORD_INCORRECT")
          : t("errors.validation");
      return { errors: {}, formError, success: false };
    }
    throw error;
  }

  return { errors: {}, formError: null, success: true };
}
