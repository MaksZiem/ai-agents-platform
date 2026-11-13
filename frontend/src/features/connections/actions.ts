"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
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
  const values = readConnectionForm(formData);
  const result = validateConnectionForm(values, { secretStored });
  const safeValues = { ...values, secret: "" };

  if (!result.payload) {
    return { values: safeValues, errors: result.errors, formError: null };
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
          error.status === 400 || error.status === 409
            ? error.message
            : "Could not save the connection. Try again.",
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
