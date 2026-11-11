"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function deleteFile(fileId: string) {
  await apiFetch(`/files/${fileId}`, { method: "DELETE" });
  refresh();
}
