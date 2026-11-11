import {
  AUTH_TYPES,
  HTTP_METHODS,
  type AuthType,
  type Connection,
  type HttpMethod,
} from "@/features/connections/types";

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  none: "No authentication",
  bearer: "Bearer token",
  header: "API key header",
};

export type ConnectionFormValues = {
  name: string;
  description: string;
  baseUrl: string;
  authType: AuthType;
  authHeaderName: string;
  secret: string;
  allowedMethods: HttpMethod[];
};

export type ConnectionFormField = keyof ConnectionFormValues;

export type ConnectionFormState = {
  values: ConnectionFormValues;
  errors: Partial<Record<ConnectionFormField, string>>;
  formError: string | null;
};

export type ConnectionPayload = {
  name: string;
  description: string;
  baseUrl: string;
  authType: AuthType;
  authHeaderName?: string;
  secret?: string;
  allowedMethods: HttpMethod[];
};

export const EMPTY_CONNECTION_FORM: ConnectionFormValues = {
  name: "",
  description: "",
  baseUrl: "",
  authType: "bearer",
  authHeaderName: "X-API-Key",
  secret: "",
  allowedMethods: ["GET"],
};

function isAuthType(value: string): value is AuthType {
  return (AUTH_TYPES as readonly string[]).includes(value);
}

function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value);
}

export function readConnectionForm(formData: FormData): ConnectionFormValues {
  const read = (field: ConnectionFormField) =>
    String(formData.get(field) ?? "").trim();
  const authType = read("authType");

  return {
    name: read("name").toLowerCase(),
    description: read("description"),
    baseUrl: read("baseUrl"),
    authType: isAuthType(authType) ? authType : "none",
    authHeaderName: read("authHeaderName"),
    secret: String(formData.get("secret") ?? ""),
    allowedMethods: formData
      .getAll("allowedMethods")
      .map(String)
      .filter(isHttpMethod),
  };
}

type ValidationResult =
  | { payload: ConnectionPayload; errors: null }
  | { payload: null; errors: ConnectionFormState["errors"] };

export function validateConnectionForm(
  values: ConnectionFormValues,
  { secretStored }: { secretStored: boolean },
): ValidationResult {
  const errors: ConnectionFormState["errors"] = {};

  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(values.name)) {
    errors.name =
      "Start with a letter; use lowercase letters, digits, - or _ (max 64).";
  }

  if (values.description.length > 500) {
    errors.description = "Description must be at most 500 characters.";
  }

  try {
    const url = new URL(values.baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      errors.baseUrl = "Use an http:// or https:// URL.";
    }
  } catch {
    errors.baseUrl = "Enter a full URL, e.g. https://api.example.com/v1.";
  }

  if (
    values.authType === "header" &&
    !/^[A-Za-z0-9-]{1,100}$/.test(values.authHeaderName)
  ) {
    errors.authHeaderName = "Enter a header name, e.g. X-API-Key.";
  }

  if (values.authType !== "none" && !values.secret && !secretStored) {
    errors.secret = "Enter the token or key.";
  }

  if (values.allowedMethods.length === 0) {
    errors.allowedMethods = "Allow at least one method.";
  }

  if (Object.keys(errors).length > 0) return { payload: null, errors };

  return {
    errors: null,
    payload: {
      name: values.name,
      description: values.description,
      baseUrl: values.baseUrl,
      authType: values.authType,
      ...(values.authType === "header" && {
        authHeaderName: values.authHeaderName,
      }),
      ...(values.authType !== "none" &&
        values.secret && { secret: values.secret }),
      allowedMethods: values.allowedMethods,
    },
  };
}

export function connectionToFormValues(
  connection: Connection,
): ConnectionFormValues {
  return {
    name: connection.name,
    description: connection.description ?? "",
    baseUrl: connection.baseUrl,
    authType: connection.authType,
    authHeaderName: connection.authHeaderName ?? "X-API-Key",
    secret: "",
    allowedMethods: connection.allowedMethods,
  };
}
