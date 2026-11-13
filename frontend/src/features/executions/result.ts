import type { ExecutionStep } from "@/features/executions/types";

export type ReportArtifact = {
  fileId: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  chartCount: number;
};

export type EmailArtifact = {
  to: string;
  subject: string;
  attachment: string | null;
  sentAt: string | null;
};

export type CalculationArtifact = {
  name: string;
  expression: string;
  value: number;
};

export type AnswerArtifact = {
  question: string;
  answer: string;
};

export type ApiWriteArtifact = {
  connection: string;
  method: string;
  url: string;
  status: number;
};

export type SourceArtifact = {
  label: string;
  url: string;
  kind: "web" | "api";
};

export type ResultArtifacts = {
  reports: ReportArtifact[];
  emails: EmailArtifact[];
  calculations: CalculationArtifact[];
  answers: AnswerArtifact[];
  apiWrites: ApiWriteArtifact[];
  sources: SourceArtifact[];
};

type Data = Record<string, unknown>;

function text(data: Data | null, key: string): string {
  const value = data?.[key];
  return typeof value === "string" ? value : "";
}

function number(data: Data | null, key: string): number {
  const value = data?.[key];
  return typeof value === "number" ? value : 0;
}

function records(value: unknown): Data[] {
  return Array.isArray(value)
    ? value.filter((item): item is Data => typeof item === "object" && item !== null)
    : [];
}

export function extractArtifacts(steps: ExecutionStep[]): ResultArtifacts {
  const artifacts: ResultArtifacts = {
    reports: [],
    emails: [],
    calculations: [],
    answers: [],
    apiWrites: [],
    sources: [],
  };
  const calculations = new Map<string, CalculationArtifact>();
  const sourceUrls = new Set<string>();

  function addSource(source: SourceArtifact) {
    if (!source.url || sourceUrls.has(source.url)) return;
    sourceUrls.add(source.url);
    artifacts.sources.push(source);
  }

  for (const step of steps) {
    if (step.type !== "TOOL_CALL" || step.status !== "COMPLETED") continue;
    const { input, output } = step;

    switch (step.toolName) {
      case "generateReport":
        if (text(output, "fileId")) {
          artifacts.reports.push({
            fileId: text(output, "fileId"),
            title: text(output, "title"),
            fileName: text(output, "fileName"),
            sizeBytes: number(output, "sizeBytes"),
            chartCount: number(output, "chartCount"),
          });
        }
        break;
      case "sendEmail":
        artifacts.emails.push({
          to: text(input, "to"),
          subject: text(input, "subject"),
          attachment: text(output, "attachment") || null,
          sentAt: text(output, "sentAt") || null,
        });
        break;
      case "calculate":
        for (const result of records(output?.results)) {
          const name = text(result, "name");
          if (name) {
            calculations.set(name, {
              name,
              expression: text(result, "expression"),
              value: number(result, "value"),
            });
          }
        }
        break;
      case "askUser":
        artifacts.answers.push({
          question: text(output, "question"),
          answer: text(output, "answer"),
        });
        break;
      case "httpRequest": {
        const method = text(output, "method");
        if (method && method !== "GET") {
          artifacts.apiWrites.push({
            connection: text(output, "connection"),
            method,
            url: text(output, "url"),
            status: number(output, "status"),
          });
        } else {
          addSource({
            kind: "api",
            label: `${text(output, "connection")} · ${text(output, "url")}`,
            url: text(output, "url"),
          });
        }
        break;
      }
      case "fetchUrl": {
        const url = text(output, "finalUrl") || text(output, "url");
        addSource({ kind: "web", label: text(output, "title") || url, url });
        break;
      }
    }
  }

  artifacts.calculations = [...calculations.values()];
  return artifacts;
}

export function hasArtifacts(artifacts: ResultArtifacts) {
  return Object.values(artifacts).some((list) => list.length > 0);
}
