"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import type { Execution } from "@/features/executions/types";

export async function cancelExecution(executionId: string) {
  try {
    await apiFetch(`/executions/${executionId}/cancel`, { method: "POST" });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error;
  }
  refresh();
}

export async function deleteExecution(
  executionId: string,
  redirectTo: string | null,
) {
  try {
    await apiFetch(`/executions/${executionId}`, { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  if (redirectTo) redirect(redirectTo);
  refresh();
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
  const t = await getTranslations("executions.run.errors");
  const task = String(formData.get("task") ?? "").trim();

  if (!task) return { error: t("empty"), task };
  if (task.length > MAX_TASK_LENGTH) {
    return { error: t("tooLong", { max: MAX_TASK_LENGTH }), task };
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
      return { error: t("agentInactive"), task };
    }
    if (
      error.code === "RATE_LIMIT_STARTS" ||
      error.code === "RATE_LIMIT_CONCURRENT" ||
      error.code === "DAILY_TOKEN_LIMIT" ||
      error.code === "AI_DAILY_LIMIT"
    ) {
      return { error: t(error.code, error.params), task };
    }
    return { error: t("failed"), task };
  }

  redirect(`/executions/${execution.id}`);
}
