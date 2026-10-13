"use server";

import { apiFetch } from "@/lib/api";

export async function getSocketToken() {
  const { token } = await apiFetch<{ token: string }>("/auth/socket-token", {
    method: "POST",
  });
  return token;
}
