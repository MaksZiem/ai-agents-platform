"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";

async function decide(approvalId: string, decision: "approve" | "reject") {
  try {
    await apiFetch(`/approvals/${approvalId}/${decision}`, { method: "POST" });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error;
  }
  refresh();
}

export async function approveApproval(approvalId: string) {
  await decide(approvalId, "approve");
}

export async function rejectApproval(approvalId: string) {
  await decide(approvalId, "reject");
}
