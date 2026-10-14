import type { ExecutionStep } from "@/features/executions/types";

export function getStepTitle(step: Pick<ExecutionStep, "type" | "toolName">) {
  if (step.type === "PLAN") return "Planning";
  if (step.type === "FINAL_ANSWER") return "Final result";
  return step.toolName ?? "Tool call";
}
