"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";

export type UploadState = {
  error: string | null;
  uploadedName: string | null;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadDocument(
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload.", uploadedName: null };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Files can be at most 5 MB.", uploadedName: null };
  }

  const body = new FormData();
  body.append("file", file);

  try {
    await apiFetch("/knowledge", { method: "POST", body });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 413)
    ) {
      return { error: error.message, uploadedName: null };
    }
    throw error;
  }

  refresh();
  return { error: null, uploadedName: file.name };
}

export async function deleteDocument(documentId: string) {
  await apiFetch(`/knowledge/${documentId}`, { method: "DELETE" });
  refresh();
}

export async function attachDocument(agentId: string, formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  if (!documentId) return;

  await apiFetch(`/agents/${agentId}/knowledge/${documentId}`, {
    method: "PUT",
  });
  refresh();
}

export async function detachDocument(agentId: string, documentId: string) {
  try {
    await apiFetch(`/agents/${agentId}/knowledge/${documentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  refresh();
}
