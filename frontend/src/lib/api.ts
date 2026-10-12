import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(response: Response) {
  const fallback = response.statusText || "Request failed";

  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("message" in body)) {
      return fallback;
    }
    const { message } = body;
    if (Array.isArray(message)) return message.join(", ");
    return typeof message === "string" ? message : fallback;
  } catch {
    return fallback;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, auth = true, ...init } = options;
  const token = auth ? await getAccessToken() : null;

  if (auth && !token) redirect("/login");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });

  if(auth && response.status === 401) redirect("/login")

  if(!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  return response.json() as Promise<T>
}
