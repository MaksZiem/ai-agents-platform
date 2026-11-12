"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { agentsHref } from "@/features/agents/search";
import type { AgentView } from "@/features/agents/types";

const DEBOUNCE_MS = 250;

type AgentSearchProps = {
  query: string;
  view: AgentView;
};

export function AgentSearch({ query, view }: AgentSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  const [requested, setRequested] = useState(query);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (query !== syncedQuery) {
    setSyncedQuery(query);
    if (query !== requested) {
      setRequested(query);
      setValue(query);
    }
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function navigate(next: string) {
    if (timer.current) clearTimeout(timer.current);
    const nextQuery = next.trim();
    setRequested(nextQuery);
    startTransition(() => {
      router.replace(agentsHref({ view, query: nextQuery }), { scroll: false });
    });
  }

  function handleChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(next), DEBOUNCE_MS);
  }

  function clear() {
    setValue("");
    navigate("");
  }

  return (
    <div role="search" className="relative w-full max-w-sm">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            clear();
          }
          if (event.key === "Enter") navigate(value);
        }}
        placeholder="Search agents by name, description or model…"
        aria-label="Search agents"
        className={`h-[34px] w-full rounded-md border border-border-strong bg-bg pr-8 pl-8 text-sm placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
          pending ? "opacity-70" : ""
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}
