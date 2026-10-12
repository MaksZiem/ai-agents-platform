"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";

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
