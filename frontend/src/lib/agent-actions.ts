"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  readAgentForm,
  validateAgentForm,
  type AgentFormState,
} from "@/lib/agent-form";
import type { Agent, AgentStatus } from "@/lib/types";

type SaveResult =
  | { state: AgentFormState; agent: null }
  | { state: null; agent: Agent };

async function saveAgent(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<SaveResult> {
  const values = readAgentForm(formData);
  const result = validateAgentForm(values);

  if (!result.payload) {
    return {
      agent: null,
      state: { values, errors: result.errors, formError: null },
    };
  }

  try {
    const agent = await apiFetch<Agent>(path, { method, body: result.payload });
    return { agent, state: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        agent: null,
        state: {
          values,
          errors: {},
          formError:
            error.status === 400
              ? error.message
              : "Could not save the agent. Try again.",
        },
      };
    }
    throw error;
  }
}

export async function createAgent(
  _prevState: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const result = await saveAgent("/agents", "POST", formData);
  if (result.agent === null) return result.state;

  redirect(`/agents/${result.agent.id}`);
}

export async function updateAgent(
  agentId: string,
  _prevState: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const result = await saveAgent(`/agents/${agentId}`, "PATCH", formData);
  if (result.agent === null) return result.state;

  redirect(`/agents/${agentId}`);
}

export async function duplicateAgent(agentId: string) {
  const copy = await apiFetch<Agent>(`/agents/${agentId}/duplicate`, {
    method: "POST",
  });
  redirect(`/agents/${copy.id}`);
}

export async function setAgentStatus(agentId: string, status: AgentStatus) {
  await apiFetch<Agent>(`/agents/${agentId}`, {
    method: "PATCH",
    body: { status },
  });
  refresh();
}

export async function deleteAgent(agentId: string) {
  await apiFetch(`/agents/${agentId}`, { method: "DELETE" });
  redirect("/agents");
}

export async function enableTool(
  agentId: string,
  toolName: string,
  requiresApproval: boolean,
) {
  await apiFetch(`/agents/${agentId}/tools/${encodeURIComponent(toolName)}`, {
    method: "PUT",
    body: { requiresApproval },
  });
  refresh();
}

export async function disableTool(agentId: string, toolName: string) {
  try {
    await apiFetch(`/agents/${agentId}/tools/${encodeURIComponent(toolName)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  refresh();
}
