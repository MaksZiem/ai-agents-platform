"use server";

import { redirect } from "next/navigation";
import { clearAccessToken } from "@/lib/session";

export async function logout() {
  await clearAccessToken();
  redirect("/login");
}
