"use server";

import { refresh } from "next/cache";
import { getTranslations } from "next-intl/server";
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

const MAX_ANSWER_LENGTH = 4000;

export async function submitAnswer(
  approvalId: string,
  _prevState: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const t = await getTranslations();
  const answer = String(formData.get("answer") ?? "").trim();

  if (!answer) return { error: t("approvals.question.errors.empty") };
  if (answer.length > MAX_ANSWER_LENGTH) {
    return { error: t("approvals.question.errors.tooLong", { max: MAX_ANSWER_LENGTH }) };
  }

  try {
    await decide(approvalId, "approve", { answer });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: t("errors.validation") };
    }
    throw error;
  }
  return { error: null };
}
