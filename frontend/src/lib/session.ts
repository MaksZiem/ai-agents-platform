import { cookies } from "next/headers";

const TOKEN_COOKIE = "access_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60;

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function setAccessToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS
  });
}

export async function clearAccessToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}
