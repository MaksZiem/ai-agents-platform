## Zasady pracy
- Backend (`backend/`) piszę SAMODZIELNIE w celach nauki.
  CLAUDE pokazuje kod do przepisania, ze ścieżką pliku i krótkim wyjaśnieniem
  co i dlaczego.
- CLAUDE sam edytuje pliki na backendzie tylko jesli ja go poprosze
- Dzielimy pracę na małe kroki, jeden plik lub koncept na raz.
- Gdy poproszę o review, Claude czyta moje pliki i wskazuje błędy,
  ale ich nie poprawia.
- Frontend (`frontend/`): Claude może edytować pliki bezpośrednio.

## Struktura repo
- `backend/` — NestJS (TypeScript)
- `frontend/` — Next.js (App Router, TypeScript, Tailwind)

---

# AI Agent Platform

## 1. Overview

Build a full-stack platform for creating, configuring, executing and monitoring AI agents.

The application should allow a user to create an AI agent that can perform multi-step tasks using configured tools, knowledge sources and permissions.

The product should feel like a real SaaS application rather than a simple AI chatbot.

The core idea is:

> The user defines what an agent is allowed to do, gives it tools and knowledge, and then delegates tasks to it.

The agent should be able to:

* understand the user's request,
* create an execution plan,
* execute multiple steps,
* call tools,
* use external/contextual data,
* maintain execution state,
* request human approval for sensitive operations,
* continue after approval,
* produce a final result,
* expose the execution history.

---

# 2. Example User

The primary example user is a developer, technical user, analyst or small business team.

The application should demonstrate that AI agents can be used to automate real workflows.

Example agents:

* Financial Analyst
* Research Assistant
* Sales Analyst
* Customer Support Agent
* Document Analyst
* Developer Assistant

The application should not be limited to financial analysis.

Financial Analyst should be used as the main demo agent because it provides an easy-to-understand example.

---

# 3. Core User Journey

A typical user journey should look like this:

1. User creates an account.
2. User enters the dashboard.
3. User creates an agent.
4. User configures the agent's name and instructions.
5. User selects an LLM model.
6. User configures tools.
7. User uploads knowledge/document sources.
8. User configures permissions.
9. User saves the agent.
10. User starts a task.
11. The agent creates a plan.
12. The agent executes the plan step by step.
13. The UI displays live execution progress.
14. If a sensitive tool requires approval, execution pauses.
15. User approves or rejects the action.
16. Agent continues if approved.
17. Agent produces the final result.
18. The execution is saved and can be inspected later.

---

# 4. Application Structure

The application should have a SaaS dashboard layout.

Main navigation:

* Dashboard
* Agents
* Tasks / Executions
* Knowledge
* Tools
* Approvals
* Settings

Possible future sections:

* Usage
* API Keys
* Team
* Billing

These future sections do not need to be implemented initially.

---

# 5. Dashboard

The dashboard should provide an overview of the system.

Example:

```text
Good morning.

Agents
5

Tasks today
24

Running
2

Waiting for approval
1
```

Below the statistics:

```text
Recent executions

Financial Analyst
Analyze Q1 spending
RUNNING

Sales Analyst
Generate monthly report
COMPLETED

Research Agent
Analyze competitors
WAITING FOR APPROVAL
```

The dashboard should allow the user to quickly navigate to:

* an agent,
* an execution,
* an approval request.

---

# 6. Agent Management

The user should be able to:

* create an agent,
* edit an agent,
* duplicate an agent,
* activate/deactivate an agent,
* delete an agent,
* inspect an agent's execution history.

Agent configuration should include:

## Identity

```text
Name
Description
Avatar/icon
Status
```

## Model

```text
Provider
Model
Temperature
Maximum output tokens
```

Initially Gemini should be the primary supported provider.

The architecture should allow additional providers later.

---

# 7. Agent Instructions

Each agent has a system-level instruction.

Example:

```text
You are a financial analyst.

Analyze financial data carefully.
Never invent financial information.
When creating reports, clearly distinguish
between facts and assumptions.

Ask for clarification when the task is ambiguous.
```

The UI should provide a large editor for these instructions.

Future versions may provide:

* instruction templates,
* version history,
* testing playground.

---

# 8. Tools

Tools are one of the most important concepts in the application.

An agent should not directly access everything.

Instead, it receives explicit tools.

Example:

```text
getTransactions()
analyzeTransactions()
comparePeriods()
generateReport()
searchDocuments()
sendEmail()
```

The agent configuration should show available tools:

```text
Tools

✓ getTransactions
✓ analyzeTransactions
✓ comparePeriods
✓ generateReport
✓ searchDocuments
☐ sendEmail
```

Each tool should define:

* name,
* description,
* input schema,
* output schema,
* permissions,
* whether approval is required.

The implementation should use structured schemas for tool inputs and outputs.

---

# 9. Example Tools

The first version should use deterministic/mock tools where appropriate.

## getTransactions

Input:

```json
{
  "from": "2026-01-01",
  "to": "2026-03-31"
}
```

Returns transaction data.

## analyzeTransactions

Analyzes transaction data.

Possible output:

```json
{
  "total": 42182,
  "categories": [...],
  "anomalies": [...]
}
```

## comparePeriods

Compares two time periods.

## generateReport

Creates a structured report.

## searchDocuments

Searches the agent's knowledge base.

## sendEmail

Sends an email.

This tool should require explicit approval in the default configuration.

---

# 10. Permissions

Permissions are a core part of the product.

The user should be able to control what an agent can do.

Example:

```text
Financial data
✓ Read
✗ Modify
✗ Delete

Documents
✓ Read
✓ Search
✗ Delete

Email
✓ Send with approval
```

The permission system should be designed so that sensitive operations cannot be performed merely because the LLM decided to call a tool.

The backend must enforce permissions.

Permissions must never rely solely on prompts.

---

# 11. Knowledge

Users should be able to provide documents to agents.

Example:

```text
Knowledge

financial-policy.pdf
annual-report.pdf
company-budget.xlsx
expense-policy.pdf
```

The platform should eventually support:

* file upload,
* document extraction,
* chunking,
* embeddings,
* vector search,
* retrieval.

The first implementation can be deliberately simple.

The architecture should allow RAG to evolve independently from the agent execution engine.

---

# 12. Agent Task Interface

The user should have a dedicated interface for starting an execution.

Example:

```text
Financial Analyst

What would you like the agent to do?

[ Analyze our Q1 spending and compare it
  with Q4. Find unusual expenses and create
  a report. ]

                         [Run Agent]
```

The user should not need to manually define every execution step.

The agent is responsible for planning the task.

---

# 13. Agent Execution

Every execution should have persistent state.

Example:

```text
Execution #1832

Status:
RUNNING

Task:
Analyze Q1 spending and compare it with Q4.
```

The execution should contain steps.

Example:

```text
PLAN
↓
getTransactions
↓
getTransactions
↓
analyzeTransactions
↓
comparePeriods
↓
generateReport
↓
DONE
```

Each step should have:

* status,
* start time,
* end time,
* input,
* output,
* error if applicable,
* duration,
* tool used.

---

# 14. Execution States

Executions should support states such as:

```text
QUEUED
RUNNING
WAITING_FOR_APPROVAL
COMPLETED
FAILED
CANCELLED
```

State transitions should be explicit.

The backend should be the source of truth for execution state.

The frontend should reflect backend state.

---

# 15. Live Execution UI

The user should be able to watch an agent work.

Example:

```text
Execution #1832

✓ Planning
  Created execution plan

✓ getTransactions
  Retrieved 2,381 transactions

✓ getTransactions
  Retrieved 2,109 transactions

⟳ analyzeTransactions
  Analyzing spending patterns...

○ comparePeriods

○ generateReport
```

The interface should update in real time.

WebSockets should be used for live execution events.

The user should not need to refresh the page.

---

# 16. Human-in-the-loop

Sensitive operations should pause execution.

Example:

```text
Approval Required

The agent wants to send:

Q1 Financial Report.pdf

to:

accountant@company.com

Reason:

The user requested that the completed
report be sent to the accountant.

[Reject]       [Approve]
```

The execution state becomes:

```text
WAITING_FOR_APPROVAL
```

After approval:

```text
APPROVED
↓
tool execution
↓
next step
```

After rejection:

```text
REJECTED
↓
agent decides how to continue or terminate
```

The approval must be persisted.

---

# 17. Cancellation

The user should be able to cancel a running execution.

Example:

```text
Execution #1832

RUNNING

[ Cancel execution ]
```

Cancellation should propagate to the execution engine.

The system should prevent new steps from being started after cancellation.

Long-running operations should support cancellation where possible.

---

# 18. Retry and Failure Handling

The agent execution engine must account for failures.

Examples:

* Gemini request timeout,
* tool failure,
* external API failure,
* malformed model output,
* worker crash.

The system should distinguish between:

```text
retryable failure
```

and:

```text
permanent failure
```

Retries should be controlled and observable.

The UI should show retry attempts.

Example:

```text
generateReport

Attempt 2 / 3

Previous attempt:
TIMEOUT
```

---

# 19. Execution History

Users should be able to inspect previous executions.

Example:

```text
Executions

Financial Analyst
Analyze Q1 spending
COMPLETED
Today 14:32

Financial Analyst
Analyze February expenses
FAILED
Today 12:14

Sales Analyst
Generate sales report
COMPLETED
Yesterday
```

Opening an execution should show the complete execution timeline.

---

# 20. Observability

The platform should collect execution-level telemetry.

Each execution should provide:

* total duration,
* token usage,
* model,
* tool calls,
* retries,
* failures,
* approval requests,
* final status.

Example:

```text
Execution metrics

Duration        18.4s
LLM calls       4
Tool calls      5
Retries         1
Tokens          8,421
```

This is useful both for the user and for debugging.

---

# 21. Backend Architecture

The backend should conceptually contain:

```text
API
│
├── Auth
├── Agents
├── Tools
├── Knowledge
├── Executions
├── Approvals
└── Users

Execution Engine
│
├── Planner
├── Tool Executor
├── State Manager
├── Permission Manager
└── Approval Manager

Async infrastructure
│
├── Redis
├── BullMQ
└── Workers

AI
│
└── Gemini
```

The architecture should separate:

* API layer,
* execution orchestration,
* tool execution,
* persistence,
* AI provider integration.

---

# 22. Database Concepts

The exact schema can evolve, but the system will likely need concepts such as:

```text
User
Agent
AgentTool
Tool
KnowledgeSource
Document
DocumentChunk
Execution
ExecutionStep
Approval
ToolCall
```

The database should persist execution state so that an execution is not lost if a process crashes.

---

# 23. Security

Security should be treated as a first-class feature.

Important principles:

* backend-enforced permissions,
* authentication,
* authorization,
* isolated agent configuration,
* validated tool inputs,
* no arbitrary code execution,
* secrets must not be exposed to the LLM,
* audit trail for sensitive actions,
* approval required for sensitive operations.

The model should never be treated as a trusted component.

---

# 24. Future Features

Potential future functionality:

* multiple LLM providers,
* agent templates,
* team collaboration,
* scheduled executions,
* API access,
* webhooks,
* Slack integration,
* Gmail integration,
* calendar integration,
* custom tools,
* MCP integration,
* agent versioning,
* evaluation framework,
* cost limits,
* rate limits.

These should not be implemented in the first version unless needed.

---

# 25. Product Goal

The final application should demonstrate:

> A production-oriented AI agent execution platform, not simply an LLM chat interface.

The most important demo should be:

```text
Create Agent
      ↓
Configure Tools
      ↓
Configure Permissions
      ↓
Give Agent a Task
      ↓
Agent Creates Plan
      ↓
Agent Executes Tools
      ↓
Live Execution Updates
      ↓
Human Approval
      ↓
Continue Execution
      ↓
Final Result
      ↓
Persistent Execution History
```

The application should feel like a real developer/productivity platform.
