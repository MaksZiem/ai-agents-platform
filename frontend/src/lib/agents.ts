import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Agent } from "@/lib/types";

export async function getAgent(id: string) {
  try {
    return await apiFetch<Agent>(`/agents/${id}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}