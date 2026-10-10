# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences served equally:

- **Technical users (developers):** understand tools, JSON schemas and logs; want to see the inside of every execution (step input/output, tokens, retries, errors).
- **Analysts and small business teams:** delegate tasks to an agent, approve sensitive actions, read the final result. Technical detail must be one step away, not in their face.

Default views stay readable for the analyst; technical depth is always reachable on demand.

## Product Purpose

AI Agent Platform lets a user define what an agent is allowed to do (instructions, model, tools, knowledge, permissions), delegate a multi-step task to it, watch it plan and execute live, approve or reject sensitive actions, and inspect the full execution history afterwards.

Success: the core demo flow runs end to end and reads clearly. Create agent → configure tools and permissions → give a task → agent plans → tools execute with live updates → human approval → continue → final result → persistent history.

The project is primarily a **portfolio / demo** piece. It must feel like a real production SaaS developer/productivity platform, not an LLM chat interface. Financial Analyst is the main demo agent; the product is not limited to finance.

## Positioning

An agent **execution platform** with backend-enforced permissions and human-in-the-loop approvals, not a chatbot. The agent receives explicit tools; sensitive operations cannot happen just because the model decided to call a tool. Execution state is persistent, observable and owned by the backend.

## Operating Context

Mixed usage:

- **Long desk sessions:** configuring agents, watching live executions, debugging failures and retries, open beside other tools.
- **Short visits:** start a task, come back later, approve a pending action, check a result.

Approvals and execution status must be quickly findable from anywhere (dashboard, navigation).

## Capabilities and Constraints

- Main navigation: Dashboard, Agents, Tasks / Executions, Knowledge, Tools, Approvals, Settings. Future: Usage, API Keys, Team, Billing (not built initially).
- Agent config: identity (name, description, avatar/icon, status), model (provider, model, temperature, max output tokens; Gemini first), system instructions (large editor), tools, knowledge sources, permissions.
- Agent actions: create, edit, duplicate, activate/deactivate, delete, view execution history.
- Execution states: QUEUED, RUNNING, WAITING_FOR_APPROVAL, COMPLETED, FAILED, CANCELLED. Backend is source of truth; frontend reflects it.
- Execution steps carry status, start/end time, duration, input, output, error, tool used, retry attempts (e.g. "Attempt 2 / 3, previous: TIMEOUT").
- Live updates over WebSockets; no page refresh.
- Approvals: pause execution, show what the agent wants to do and why, Approve / Reject; persisted.
- Cancellation of running executions.
- Metrics per execution: duration, LLM calls, tool calls, retries, tokens, model, final status.
- Tools initially deterministic/mock: getTransactions, analyzeTransactions, comparePeriods, generateReport, searchDocuments, sendEmail (requires approval by default).
- Knowledge: document upload; RAG kept simple initially.
- Frontend: Next.js (App Router, TypeScript, Tailwind v4), written by hand by the developer for learning; design guidance must translate into code they can type step by step.

## Brand Commitments

- Visual direction chosen by the user (2026-10-10): **the category standard, played straight**: a dark, neutral developer-tool dashboard, executed at full craft. No themed metaphor or quirk.
- Quality bar: **Vercel** dashboard. Its precision, typography and restraint are the reference.
- Must not look like an AI chat (no message bubbles, no "magic AI" gradients), must not look like a generic admin template, must stay easy to write by hand step by step.

## Evidence on Hand

No real customers, testimonials, usage numbers or pricing exist. Demo data (transactions, executions, agents) is synthetic and must be presented as demo data, never as real claims.

## Product Principles

1. The agent's work is visible: every plan, step, tool call, retry and approval is inspectable.
2. Control before autonomy: permissions and approvals are first-class, never hidden in settings.
3. State is truth: the UI always shows what the backend says, including failure and waiting states.
4. Readable by default, deep on demand: analyst-friendly surfaces with technical detail one click away.
5. Production feel over chat feel: this is an operations platform, not a conversation.
