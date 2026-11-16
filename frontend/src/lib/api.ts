import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type ApiErrorParams = Record<string, string | number>;

export class ApiError extends Error {
  status: number;
  code: string | null;
  params: ApiErrorParams;

  constructor(
    status: number,
    message: string,
    code: string | null = null,
    params: ApiErrorParams = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.params = params;
  }
}

async function readError(response: Response) {
  const fallback = response.statusText || "Request failed";

  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) {
      return new ApiError(response.status, fallback);
    }
    const { message, code, params } = body as Record<string, unknown>;
    const text = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : fallback;
    return new ApiError(
      response.status,
      text,
      typeof code === "string" ? code : null,
      typeof params === "object" && params !== null ? (params as ApiErrorParams) : {},
    );
  } catch {
    return new ApiError(response.status, fallback);
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
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: serializeBody(body),
    cache: "no-store",
  });

  if (auth && response.status === 401) redirect("/login");

  if (!response.ok) {
    throw await readError(response);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

function serializeBody(body: unknown) {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}
