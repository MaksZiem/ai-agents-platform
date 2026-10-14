import type { Agent } from "@/features/agents/types";

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
] as const;

export type AgentFormValues = {
  name: string;
  description: string;
  icon: string;
  model: string;
  temperature: string;
  maxOutputTokens: string;
  instructions: string;
};

export type AgentFormField = keyof AgentFormValues;

export type AgentFormState = {
  values: AgentFormValues;
  errors: Partial<Record<AgentFormField, string>>;
  formError: string | null;
};

export type AgentPayload = Pick<
  Agent,
  "name" | "model" | "instructions" | "temperature" | "maxOutputTokens"
> & {
  description: string | null;
  icon: string | null;
};

export const EMPTY_AGENT_FORM: AgentFormValues = {
  name: "",
  description: "",
  icon: "",
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
    icon: read("icon"),
    model: read("model"),
    temperature: read("temperature"),
    maxOutputTokens: read("maxOutputTokens"),
    instructions: read("instructions"),
  };
}

type ValidationResult =
  | { payload: AgentPayload; errors: null }
  | { payload: null; errors: AgentFormState["errors"] };

export function validateAgentForm(values: AgentFormValues): ValidationResult {
  const errors: AgentFormState["errors"] = {};

  if (!values.name) errors.name = "Name is required.";
  else if (values.name.length > 100)
    errors.name = "Name must be at most 100 characters.";

  if (values.description.length > 500) {
    errors.description = "Description must be at most 500 characters.";
  }

  if (values.icon.length > 32) errors.icon = "Icon is too long.";

  if (!values.model) errors.model = "Choose a model.";

  const temperature = Number(values.temperature);
  if (
    values.temperature === "" ||
    Number.isNaN(temperature) ||
    temperature < 0 ||
    temperature > 2
  ) {
    errors.temperature = "Temperature must be between 0 and 2.";
  }

  const maxOutputTokens = Number(values.maxOutputTokens);
  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 1 ||
    maxOutputTokens > 65536
  ) {
    errors.maxOutputTokens = "Use a whole number between 1 and 65,536.";
  }

  if (!values.instructions) errors.instructions = "Instructions are required.";

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
      icon: values.icon || null,
    },
  };
}

export function agentToFormValues(agent: Agent): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description ?? "",
    icon: agent.icon ?? "",
    model: agent.model,
    temperature: String(agent.temperature),
    maxOutputTokens: String(agent.maxOutputTokens),
    instructions: agent.instructions,
  };
}
