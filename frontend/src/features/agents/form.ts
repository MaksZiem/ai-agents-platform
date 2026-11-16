import type { Agent } from "@/features/agents/types";

export const MAX_OUTPUT_TOKENS = 8192;

export const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-pro-preview",
] as const;

export type AgentFormValues = {
  name: string;
  description: string;
  model: string;
  temperature: string;
  maxOutputTokens: string;
  instructions: string;
};

export type AgentFormField = keyof AgentFormValues;

export type AgentFormErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "descriptionTooLong"
  | "modelRequired"
  | "temperatureRange"
  | "maxOutputTokensRange"
  | "instructionsRequired";

export type AgentFormState = {
  values: AgentFormValues;
  errors: Partial<Record<AgentFormField, string>>;
  formError: string | null;
};

type AgentFormErrors = Partial<Record<AgentFormField, AgentFormErrorKey>>;

export type AgentPayload = Pick<
  Agent,
  "name" | "model" | "instructions" | "temperature" | "maxOutputTokens"
> & {
  description: string | null;
};

export const EMPTY_AGENT_FORM: AgentFormValues = {
  name: "",
  description: "",
  model: GEMINI_MODELS[0],
  temperature: "0.7",
  maxOutputTokens: "2048",
  instructions: "",
};

export function readAgentForm(formData: FormData): AgentFormValues {
  const read = (field: AgentFormField) =>
    String(formData.get(field) ?? "").trim();

  return {
    name: read("name"),
    description: read("description"),
    model: read("model"),
    temperature: read("temperature"),
    maxOutputTokens: read("maxOutputTokens"),
    instructions: read("instructions"),
  };
}

type ValidationResult =
  | { payload: AgentPayload; errors: null }
  | { payload: null; errors: AgentFormErrors };

export function validateAgentForm(values: AgentFormValues): ValidationResult {
  const errors: AgentFormErrors = {};

  if (!values.name) errors.name = "nameRequired";
  else if (values.name.length > 100) errors.name = "nameTooLong";

  if (values.description.length > 500) {
    errors.description = "descriptionTooLong";
  }

  if (!values.model) errors.model = "modelRequired";

  const temperature = Number(values.temperature);
  if (
    values.temperature === "" ||
    Number.isNaN(temperature) ||
    temperature < 0 ||
    temperature > 2
  ) {
    errors.temperature = "temperatureRange";
  }

  const maxOutputTokens = Number(values.maxOutputTokens);
  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 1 ||
    maxOutputTokens > MAX_OUTPUT_TOKENS
  ) {
    errors.maxOutputTokens = "maxOutputTokensRange";
  }

  if (!values.instructions) errors.instructions = "instructionsRequired";

  if (Object.keys(errors).length > 0) return { payload: null, errors };

  return {
    errors: null,
    payload: {
      name: values.name,
      model: values.model,
      instructions: values.instructions,
      temperature,
      maxOutputTokens,
      description: values.description || null,
    },
  };
}

export function agentToFormValues(agent: Agent): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description ?? "",
    model: agent.model,
    temperature: String(agent.temperature),
    maxOutputTokens: String(agent.maxOutputTokens),
    instructions: agent.instructions,
  };
}
