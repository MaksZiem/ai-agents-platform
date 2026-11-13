"use server";

import { hasErrors, newPasswordError } from "@/features/auth/validation";
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
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors = {
    currentPassword: currentPassword ? undefined : "Enter your current password.",
    newPassword:
      newPasswordError(newPassword) ??
      (newPassword === currentPassword
        ? "Choose a password different from the current one."
        : undefined),
    confirmPassword: !confirmPassword
      ? "Repeat the new password."
      : confirmPassword !== newPassword
        ? "The passwords do not match."
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
      return { errors: {}, formError: error.message, success: false };
    }
    throw error;
  }

  return { errors: {}, formError: null, success: true };
}
