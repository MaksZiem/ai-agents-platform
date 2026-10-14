"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/features/auth/types";

export type RegisterState = {
  error: string | null;
  name: string;
  email: string;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const entered = { name, email };

  if (!name || !email || !password) {
    return { ...entered, error: "Fill in every field." };
  }
  if (name.length > 100) {
    return { ...entered, error: "Name must be at most 100 characters." };
  }
  if (password.length < 8 || password.length > 128) {
    return { ...entered, error: "Password must be 8 to 128 characters." };
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
        error: "An account with this email already exists.",
      };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, error: error.message };
    }
    return { ...entered, error: "Could not reach the server. Try again." };
  }

  redirect("/");
}
