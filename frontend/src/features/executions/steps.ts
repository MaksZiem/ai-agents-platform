import { useTranslations } from "next-intl";
import type { ExecutionStep } from "@/features/executions/types";

export function useStepTitle() {
  const t = useTranslations("executions.steps");

  return (step: Pick<ExecutionStep, "type" | "toolName">) => {
    if (step.type === "PLAN") return t("plan");
    if (step.type === "FINAL_ANSWER") return t("final");
    return step.toolName ?? t("toolCall");
  };
}
