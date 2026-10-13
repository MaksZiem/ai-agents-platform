"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Execution } from "@/lib/types";

async function postAndRefresh(path: string) {
  try {
    await apiFetch(path, { method: "POST" });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error;
  }
  refresh();
}

export async function approveApproval(approvalId: string) {
  await postAndRefresh(`/approvals/${approvalId}/approve`);
}

export async function rejectApproval(approvalId: string) {
  await postAndRefresh(`/approvals/${approvalId}/reject`);
}

export async function cancelExecution(executionId: string) {
  await postAndRefresh(`/executions/${executionId}/cancel`);
}

export type RunTaskState = {
  error: string | null;
  task: string;
};

const MAX_TASK_LENGTH = 4000;

export async function runTask(
  agentId: string,
  _prevState: RunTaskState,
  formData: FormData,
): Promise<RunTaskState> {
  const task = String(formData.get("task") ?? "").trim();

  if (!task) return { error: "Describe what the agent should do.", task };
  if (task.length > MAX_TASK_LENGTH) {
    return { error: `Keep the task under ${MAX_TASK_LENGTH} characters.`, task };
  }

  let execution: Execution;
  try {
    execution = await apiFetch<Execution>(`/agents/${agentId}/executions`, {
      method: "POST",
      body: { task },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 409) {
      return { error: "This agent is inactive. Activate it to run tasks.", task };
    }
    if (error.status === 400) return { error: error.message, task };
    return { error: "Could not start the execution. Try again.", task };
  }

  redirect(`/executions/${execution.id}`);
}
