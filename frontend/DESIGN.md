---
name: AI Agent Platform
description: Dark, precise developer-tool dashboard for configuring, running and supervising AI agents. Quality bar is Vercel.
colors:
  bg: "#0a0a0a"
  surface: "#121317"
  surface-2: "#17191e"
  surface-hover: "#1c1f25"
  border: "#23262d"
  border-strong: "#30343c"
  fg: "#ededed"
  fg-muted: "#8b8f99"
  fg-subtle: "#62666f"
  accent: "#6e6af0"
  accent-hover: "#7f7bf3"
  success: "#3fb67a"
  warning: "#e5a83b"
  danger: "#e5534b"
typography:
  page-title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  metric:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "34px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "34px"
    padding: "0 14px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
  button-danger:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "34px"
    padding: "0 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "18px"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "34px"
    padding: "0 10px"
  nav-item:
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.md}"
    padding: "7px 10px"
  nav-item-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
  status-badge:
    rounded: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.label}"
---

# Design System: AI Agent Platform

> Status: **seed** (2026-10-10). Written before implementation from the chosen direction ("category standard", quality bar Vercel) and the approved sketch `.impeccable/mocks/decision/canon.html`. Once real screens exist, re-run `/impeccable document` in scan mode so this file describes the built system.

## Overview

**Creative North Star: "The Quiet Control Room".** A dark, neutral, dense developer-tool dashboard in the lineage of Vercel and Linear. The interface stays calm and monochrome; colour appears only where it carries meaning: execution state, the primary action, focus and selection. The agent's work (plan, steps, tool calls, retries, approvals) is the content. The chrome recedes.

Scene: a developer or analyst works through long desk sessions beside an IDE and terminal, often in the evening, watching an agent run. That forces **dark-first**. A light theme is a later addition, built on the same tokens.

Personality: precise, trustworthy, technical, unhurried. Never playful, never "AI magic".

## Colors

Restrained strategy: a tonal neutral ramp plus one accent and four state colours.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0a0a0a` | App background, main content area |
| `surface` | `#121317` | Sidebar, cards, stat cards, table body |
| `surface-2` | `#17191e` | Secondary buttons, active nav item, inputs on cards, code blocks |
| `surface-hover` | `#1c1f25` | Hover state for rows, nav items, secondary buttons |
| `border` | `#23262d` | Every 1px divider and card border |
| `border-strong` | `#30343c` | Input borders, focused-row borders |
| `fg` | `#ededed` | Primary text |
| `fg-muted` | `#8b8f99` | Secondary text, labels, metadata, inactive nav |
| `fg-subtle` | `#62666f` | Placeholders, future/pending steps, disabled. Never for body copy. |
| `accent` | `#6e6af0` | Primary button, RUNNING state, focus ring, links, the selected item, Approvals count |
| `success` | `#3fb67a` | COMPLETED, ✓ step done |
| `warning` | `#e5a83b` | WAITING_FOR_APPROVAL, retry attempts |
| `danger` | `#e5534b` | FAILED, errors, destructive actions |

**Execution state → colour (single source of truth):**

| State | Colour | Indicator |
|---|---|---|
| `QUEUED` | `fg-muted` | hollow dot |
| `RUNNING` | `accent` | filled dot with a soft pulse |
| `WAITING_FOR_APPROVAL` | `warning` | filled dot |
| `COMPLETED` | `success` | ✓ |
| `FAILED` | `danger` | ✕ |
| `CANCELLED` | `fg-subtle` | ⊘, label in muted text |

State badges are tinted rather than solid: text in the state colour, background at ~10% alpha, border at ~30% alpha (e.g. warning → `bg-warning/10 border-warning/30 text-warning`).

### Tailwind v4 implementation

Tokens live in `src/app/globals.css` and become utilities (`bg-surface`, `text-fg-muted`, `border-border`, `bg-warning/10` …):

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-surface: #121317;
  --color-surface-2: #17191e;
  --color-surface-hover: #1c1f25;
  --color-border: #23262d;
  --color-border-strong: #30343c;
  --color-fg: #ededed;
  --color-fg-muted: #8b8f99;
  --color-fg-subtle: #62666f;
  --color-accent: #6e6af0;
  --color-accent-hover: #7f7bf3;
  --color-success: #3fb67a;
  --color-warning: #e5a83b;
  --color-danger: #e5534b;

  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

## Typography

- **Geist** (UI) and **Geist Mono** (machine values), both already loaded by `next/font/google` in `layout.tsx`. One family, no display face.
- **Mono is semantic:** use it for anything a machine produced or reads: tool names (`getTransactions`), execution IDs (`#1832`), durations, token counts, model IDs, JSON input/output, dates in tables. Prose, labels and buttons stay in Geist.
- Numbers in metrics and tables use `tabular-nums`.

| Role | Size / weight | Tailwind |
|---|---|---|
| Page title | 24 / 600, tracking −0.02em | `text-2xl font-semibold tracking-tight` |
| Section / card title | 16 / 600 | `text-base font-semibold` |
| Body | 14 / 400 | `text-sm` |
| Secondary / table | 13 / 400 | `text-[13px]` |
| Label / badge / meta | 12 / 500 | `text-xs font-medium` |
| Metric value | 18 / 500 mono | `font-mono text-lg font-medium tabular-nums` |
| Code / JSON | 13 / 400 mono | `font-mono text-[13px]` |

Hierarchy comes from weight and colour (`fg` versus `fg-muted`) before size. There are no sizes beyond this table.

## Layout

- **App shell:** fixed left sidebar `224px` (`w-56`), `bg-surface`, right border `border-border`; main area `bg-bg`, scrolls independently.
- **Page header:** breadcrumb (`text-[13px] text-fg-muted`), then page title, then optional one-line description. Actions (buttons, status badge) sit right-aligned on the same row. Padding `px-6 py-5`, bottom border.
- **Content padding:** `p-6` (24px). Gaps between blocks `gap-6`; inside cards `gap-3` / `gap-4`.
- **Execution detail:** two columns. Timeline on the left (`flex-1`); right panel `400px` for the approval card, step details and metadata. Columns are separated by a 1px border, not a gap.
- **Metrics row:** 5 equal stat cards in a grid (`grid-cols-5 gap-2.5`).
- **Lists (agents, executions):** full-width tables or row lists, not card grids. Density is a feature.
- **Max content width:** none for working screens (tables use the space); forms max `720px`.
- **Responsive:** below `1024px` the right panel stacks under the timeline; below `768px` the sidebar collapses into a top bar with a menu button. The metric grid goes to `grid-cols-2`, then `grid-cols-3`, as width allows.
- Spacing scale is Tailwind's 4px scale; use steps 1, 2, 3, 4, 5, 6, 8 and 12 only.

## Elevation & Depth

Flat. Depth comes from **tonal layering** (`bg` → `surface` → `surface-2`) and 1px `border-border` outlines, never from shadows. The only shadows allowed are on floating layers (dropdown, popover, dialog, toast): `shadow-lg shadow-black/40` plus a `border-border-strong` outline. No glow, no blur, no glass.

## Shapes

- Radii: `rounded` 4px (tags, retry chips), `rounded-md` 6px (buttons, inputs, nav items), `rounded-lg` 8px (stat cards, code blocks), `rounded-xl` 12px (cards, dialogs), `rounded-full` (status badges, count pills, avatars, timeline step icons).
- Every container border is 1px. Dividers inside cards are 1px `border-border`.
- Icons: **lucide-react**, 16px (`size-4`), stroke 1.75, colour `fg-muted` unless they signal state.

## Components

**Sidebar nav.** Brand row at the top (16px accent square plus name, `font-semibold`). Items are Dashboard, Agents, Executions, Knowledge, Tools, Approvals and Settings: icon plus label, `text-sm text-fg-muted`, `rounded-md px-2.5 py-1.5`. Hover sets `bg-surface-hover text-fg`; active sets `bg-surface-2 text-fg`. Approvals shows a count pill (`bg-accent text-white text-[11px] rounded-full px-1.5`) only when the count is above 0. User and workspace sit at the bottom.

**Buttons.** Height 34px, `rounded-md`, `text-sm font-medium`, `px-3.5`.
- Primary: `bg-accent text-white hover:bg-accent-hover`. One per view region: Run Agent, Approve, Save.
- Secondary: `bg-surface-2 border border-border text-fg hover:bg-surface-hover`. Used for Cancel, Duplicate and Reject.
- Danger: secondary chrome with `text-danger`. Delete always opens a confirm dialog.
- Ghost: no background, `text-fg-muted hover:text-fg hover:bg-surface-hover`. Used for icon buttons.
- Focus (all): `focus-visible:outline-2 outline-offset-2 outline-accent`. Disabled: `opacity-50 cursor-not-allowed`.

**Status badge.** `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border` plus a 6px dot. Colours come from the state table. Labels are human-readable ("Waiting for approval"); the enum stays in data.

**Stat card.** `bg-surface border border-border rounded-lg px-3 py-2.5`. Label `text-xs text-fg-muted`, value in the metric style.

**Execution timeline step.** Grid `24px 1fr auto`, `gap-3`, `py-2.5`. Left: a 22px round state icon (tinted like the badge) with a 1px vertical connector line (`bg-border`) to the next step. Middle: tool name in mono 13/500, then a one-line result summary in `text-[13px] text-fg-muted`. Right: duration in mono 12 `text-fg-muted`. A pending step is the whole row at `opacity-50`. A running step pulses its icon (`animate-pulse` on the dot only). Clicking a step selects it (`bg-surface-hover rounded-lg`) and shows input and output JSON in the right panel.

**Retry chip.** Under the summary: `text-[11px] text-warning bg-warning/10 rounded px-1.5`, e.g. "Attempt 2/3 · previous TIMEOUT".

**Approval card.** In the right panel and on the Approvals page. `card` styling. Contents in order: a "Approval required" warning badge; a title stating the action in plain words ("Send 'Q1 Financial Report.pdf' to accountant@company.com", 16/600); a key-value grid (`grid-cols-[70px_1fr] gap-x-3 gap-y-2 text-[13px]`, keys `text-fg-muted`, tool name mono) listing Tool, Reason and, if relevant, Recipient and Attachment. Below that come two equal buttons: Reject (secondary) and Approve (primary).

**Card.** `bg-surface border border-border rounded-xl p-[18px]`. The title row sits on top, with optional actions on the right.

**Table.** `text-[13px]`. Header `text-xs font-medium text-fg-muted` with a bottom border. Rows `py-2.5` with a 1px divider and `hover:bg-surface-hover`; the whole row is clickable to open the item. IDs, durations and dates are mono and muted.

**Inputs / textarea / select.** `bg-bg border border-border-strong rounded-md h-[34px] px-2.5 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25`. Labels `text-[13px] font-medium` above, help text `text-xs text-fg-muted` below, error text `text-xs text-danger`. The agent instructions editor is a tall textarea (min 320px) in mono.

**Tool selector / permissions.** Rows with a checkbox or toggle, tool name in mono, description muted, and a "Requires approval" warning chip when applicable. The permissions matrix is a table: resource rows × Read / Modify / Delete / Send columns, with checkboxes and "with approval" as a third state.

**JSON / code block.** `bg-surface-2 border border-border rounded-lg p-3 font-mono text-[13px] overflow-auto`, with no syntax-highlighting theme beyond `fg` and `fg-muted`.

**Empty state.** A centred muted icon (24px), one line of `text-sm text-fg`, one line of muted explanation, and one primary action.

**Motion.** 150ms `ease-out` for hover and colour; new timeline steps fade and slide in 4px over 200ms; a running dot pulses. Respect `prefers-reduced-motion` (no slide, no pulse).

## Do's and Don'ts

**Do**
- Show the backend's state verbatim: every state has its colour, icon and label from the table above.
- Use mono for every machine value; keep prose in Geist.
- Keep screens dense and aligned; use tables for collections.
- Make approvals and running executions reachable in one click from the sidebar and dashboard.
- Mark demo data as demo data.

**Don't**
- No chat bubbles, avatars talking or typing indicators: this is not a chat app.
- No gradients, glows, glassmorphism, "AI sparkle" icons or purple-to-pink anything.
- No colour on decoration: colour only for state, the primary action, focus and selection.
- No shadows on in-flow cards; no radius above 12px.
- No more than one primary button per region.
- No text in `fg-subtle` for anything the user must read.
