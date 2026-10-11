import type { ExecutionDetail, ExecutionStep } from "@/lib/types";

const EXECUTION_ID = "1";

function secondsFrom(base: Date, seconds: number) {
  return new Date(base.getTime() + seconds * 1000).toISOString();
}

type MockStepOptions = Partial<ExecutionStep> & {
  start?: number;
  duration?: number;
};

function mockStep(
  base: Date,
  position: number,
  options: MockStepOptions,
): ExecutionStep {
  const { start, duration, ...fields } = options;
  const startedAt = start === undefined ? null : secondsFrom(base, start);
  const finishedAt =
    start === undefined || duration === undefined
      ? null
      : secondsFrom(base, start + duration);

  return {
    id: `step-${position}`,
    executionId: EXECUTION_ID,
    position,
    type: "TOOL_CALL",
    status: "PENDING",
    toolName: null,
    input: null,
    output: null,
    error: null,
    attempt: 1,
    startedAt,
    finishedAt,
    createdAt: startedAt ?? base.toISOString(),
    ...fields,
  };
}

export function getMockExecution(id: string): ExecutionDetail | null {
  if (id !== EXECUTION_ID) return null;

  const base = new Date(Date.now() - 3 * 60_000);
  const createdAt = base.toISOString();

  const steps: ExecutionStep[] = [
    mockStep(base, 1, { type: "PLAN", status: "COMPLETED", start: 0, duration: 1.9 }),
    mockStep(base, 2, {
      status: "COMPLETED",
      toolName: "getTransactions",
      start: 1.9,
      duration: 0.8,
      input: { from: "2026-01-01", to: "2026-03-31" },
      output: { count: 2381 },
    }),
    mockStep(base, 3, {
      status: "COMPLETED",
      toolName: "getTransactions",
      start: 2.7,
      duration: 0.7,
      input: { from: "2025-10-01", to: "2025-12-31" },
      output: { count: 2109 },
    }),
    mockStep(base, 4, {
      status: "COMPLETED",
      toolName: "analyzeTransactions",
      start: 3.4,
      duration: 6.2,
      attempt: 2,
      output: { total: 42182, anomalies: 3 },
    }),
    mockStep(base, 5, {
      status: "COMPLETED",
      toolName: "comparePeriods",
      start: 9.6,
      duration: 1.1,
      output: { change: "+12.4%" },
    }),
    mockStep(base, 6, {
      status: "COMPLETED",
      toolName: "generateReport",
      start: 10.7,
      duration: 5.6,
      output: { file: "Q1 Financial Report.pdf" },
    }),
    mockStep(base, 7, {
      status: "WAITING_FOR_APPROVAL",
      toolName: "sendEmail",
      start: 16.3,
      input: { to: "accountant@company.com", attachment: "Q1 Financial Report.pdf" },
    }),
    mockStep(base, 8, { type: "FINAL_ANSWER" }),
  ];

  return {
    id: EXECUTION_ID,
    agentId: "agent-1",
    task: "Analyze our Q1 spending and compare it with Q4. Find unusual expenses, create a report and send it to the accountant.",
    status: "WAITING_FOR_APPROVAL",
    result: null,
    error: null,
    model: "gemini-2.5-flash",
    llmCalls: 4,
    inputTokens: 6210,
    outputTokens: 2211,
    startedAt: createdAt,
    finishedAt: null,
    createdAt,
    updatedAt: createdAt,
    agent: { id: "agent-1", name: "Financial Analyst", icon: null },
    steps,
    metrics: {
      durationMs: 18400,
      llmCalls: 4,
      toolCalls: 6,
      retries: 1,
      failedSteps: 0,
      approvalRequests: 1,
      inputTokens: 6210,
      outputTokens: 2211,
      totalTokens: 8421,
    },
  };
}
