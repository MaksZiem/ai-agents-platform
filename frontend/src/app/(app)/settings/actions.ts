"use server";

import { ApiError, apiFetch } from "@/lib/api";

export type ChangePasswordState = {
  error: string | null;
  success: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Fill in every field.", success: false };
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return {
      error: "The new password must be 8 to 128 characters.",
      success: false,
    };
  }
  if (newPassword !== confirmPassword) {
    return { error: "The new passwords do not match.", success: false };
  }
  if (newPassword === currentPassword) {
    return {
      error: "Choose a password different from the current one.",
      success: false,
    };
  }

  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: error.message, success: false };
    }
    throw error;
  }

  return { error: null, success: true };
}
