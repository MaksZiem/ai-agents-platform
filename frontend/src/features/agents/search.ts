import type { Agent } from "@/features/agents/types";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function matchesAgentQuery(
  agent: Pick<Agent, "name" | "description" | "model">,
  query: string,
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const haystack = normalize(
    [agent.name, agent.description ?? "", agent.model].join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

export function agentsHref({ view, query }: { view?: string; query?: string }) {
  const params = new URLSearchParams();
  if (view && view !== "grid") params.set("view", view);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/agents?${search}` : "/agents";
}
