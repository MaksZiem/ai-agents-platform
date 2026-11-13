"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";

async function decide(
  approvalId: string,
  decision: "approve" | "reject",
  body?: { answer: string },
) {
  try {
    await apiFetch(`/approvals/${approvalId}/${decision}`, {
      method: "POST",
      body,
    });
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

export async function answerQuestion(approvalId: string, formData: FormData) {
  const answer = String(formData.get("answer") ?? "").trim();
  if (!answer) return;

  await decide(approvalId, "approve", { answer });
}

export type AnswerState = { error: string | null };

export async function submitAnswer(
  approvalId: string,
  _prevState: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const answer = String(formData.get("answer") ?? "").trim();

  if (!answer) return { error: "Write an answer or skip the question." };
  if (answer.length > 4000) {
    return { error: "Keep the answer under 4,000 characters." };
  }

  try {
    await decide(approvalId, "approve", { answer });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: error.message };
    }
    throw error;
  }
  return { error: null };
}
