"use client";

import { useId, useState, type ReactNode } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export type PickerItem = {
  id: string;
  label: string;
  meta?: string;
};

type ItemPickerProps = {
  items: PickerItem[];
  action: (formData: FormData) => Promise<void>;
  icon?: ReactNode;
  openLabel: string;
  searchLabel: string;
  noun: { one: string; other: string };
};

function matches(item: PickerItem, query: string) {
  const text = `${item.label} ${item.meta ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

export function ItemPicker({
  items,
  action,
  icon,
  openLabel,
  searchLabel,
  noun,
}: ItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const listId = useId();

  const visible = items.filter((item) => matches(item, query));
  const allVisibleSelected =
    visible.length > 0 && visible.every((item) => selected.has(item.id));

  function close() {
    setOpen(false);
    setQuery("");
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      for (const item of visible) {
        if (allVisibleSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="size-4" strokeWidth={1.75} aria-hidden />
        {openLabel}
      </Button>
    );
  }

  const count = selected.size;

  return (
    <form
      action={async (formData) => {
        await action(formData);
        close();
      }}
      className="flex flex-col gap-2"
    >
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
            if (event.key === "Escape") close();
          }}
          placeholder={searchLabel}
          aria-label={searchLabel}
          aria-controls={listId}
          autoFocus
          className="h-[34px] w-full rounded-md border border-border-strong bg-bg pr-2.5 pl-8 text-sm placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
        />
      </div>

      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-fg-muted">
          <span>
            <span className="font-mono tabular-nums">{visible.length}</span>{" "}
            {visible.length === 1 ? noun.one : noun.other}
            {query && " found"}
          </span>
          {visible.length > 1 && (
            <button
              type="button"
              onClick={toggleVisible}
              className="font-medium transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              {allVisibleSelected ? "Clear" : "Select all"}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-fg-muted">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul id={listId} className="max-h-64 overflow-y-auto py-1">
            {visible.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-1.5 transition-colors hover:bg-surface-hover">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="size-4 shrink-0 accent-accent"
                  />
                  {icon}
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {item.label}
                  </span>
                  {item.meta && (
                    <span className="hidden max-w-[45%] truncate font-mono text-xs text-fg-muted sm:block">
                      {item.meta}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <SubmitButton
          variant="primary"
          pendingLabel="Attaching…"
          disabled={count === 0}
        >
          {count === 0
            ? "Attach"
            : `Attach ${count} ${count === 1 ? noun.one : noun.other}`}
        </SubmitButton>
      </div>
    </form>
  );
}
