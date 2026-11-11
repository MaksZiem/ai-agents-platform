import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Connection } from "@/features/connections/types";

export async function getConnection(id: string) {
  try {
    return await apiFetch<Connection>(`/connections/${id}`);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      notFound();
    }
    throw error;
  }
}
