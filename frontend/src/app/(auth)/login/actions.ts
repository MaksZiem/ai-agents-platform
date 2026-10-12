"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";

export type LoginState = {
  error: string | null;
  email: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
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
      return { error: "Invalid email or password.", email };
    }
    return { error: "Could not reach the server. Try again.", email };
  }

  redirect("/");
}
