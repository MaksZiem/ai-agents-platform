"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  readConnectionForm,
  validateConnectionForm,
  type ConnectionFormState,
} from "@/features/connections/form";
import { ApiError, apiFetch } from "@/lib/api";
import type { Connection } from "@/features/connections/types";

async function saveConnection(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
  secretStored: boolean,
): Promise<ConnectionFormState | null> {
  const t = await getTranslations();
  const values = readConnectionForm(formData);
  const result = validateConnectionForm(values, { secretStored });
  const safeValues = { ...values, secret: "" };

  if (!result.payload) {
    const errors: ConnectionFormState["errors"] = {};
    for (const [field, key] of Object.entries(result.errors)) {
      errors[field as keyof typeof result.errors] = t(`connections.form.errors.${key}`);
    }
    return { values: safeValues, errors, formError: null };
  }

  try {
    await apiFetch<Connection>(path, { method, body: result.payload });
    return null;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        values: safeValues,
        errors: {},
        formError:
          error.code === "CONNECTION_NAME_TAKEN" || error.code === "CONNECTION_HEADER_RESERVED"
            ? t(`connections.form.errors.${error.code}`, {
                name: String(error.params.name ?? values.name),
                header: String(error.params.header ?? values.authHeaderName),
              })
            : error.status === 400
              ? t("errors.validation")
              : t("connections.form.saveFailed"),
      };
    }
    throw error;
  }
}

export async function createConnection(
  _prevState: ConnectionFormState,
  formData: FormData,
): Promise<ConnectionFormState> {
  const state = await saveConnection("/connections", "POST", formData, false);
  if (state) return state;

  redirect("/connections");
}

export async function updateConnection(
  connectionId: string,
  secretStored: boolean,
  _prevState: ConnectionFormState,
  formData: FormData,
): Promise<ConnectionFormState> {
  const state = await saveConnection(
    `/connections/${connectionId}`,
    "PATCH",
    formData,
    secretStored,
  );
  if (state) return state;

  redirect("/connections");
}

export async function deleteConnection(connectionId: string) {
  await apiFetch(`/connections/${connectionId}`, { method: "DELETE" });
  redirect("/connections");
}

export async function attachConnections(agentId: string, formData: FormData) {
  const connectionIds = [...new Set(formData.getAll("ids").map(String))].filter(Boolean);
  if (connectionIds.length === 0) return;

  await Promise.all(
    connectionIds.map((connectionId) =>
      apiFetch(`/agents/${agentId}/connections/${connectionId}`, { method: "PUT" }),
    ),
  );
  refresh();
}

export async function detachConnection(agentId: string, connectionId: string) {
  try {
    await apiFetch(`/agents/${agentId}/connections/${connectionId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  refresh();
}
