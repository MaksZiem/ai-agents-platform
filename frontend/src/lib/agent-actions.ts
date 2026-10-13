"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  readAgentForm,
  validateAgentForm,
  type AgentFormState,
} from "@/lib/agent-form";
import type { Agent } from "@/lib/types";

export async function createAgent(
  _prevState: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const values = readAgentForm(formData);
  const result = validateAgentForm(values);

  if (!result.payload) {
    return { values, errors: result.errors, formError: null };
  }

  try {
    await apiFetch<Agent>("/agents", { method: "POST", body: result.payload });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        values,
        errors: {},
        formError:
          error.status === 400 ? error.message : "Could not save the agent. Try again.",
      };
    }
    throw error;
  }

  redirect("/agents");
}
