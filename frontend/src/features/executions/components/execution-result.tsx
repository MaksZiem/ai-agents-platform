import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Calculator,
  Download,
  FileChartColumn,
  Globe,
  Mail,
  MessageCircleQuestionMark,
  Paperclip,
  Plug,
  Send,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { ThinkingDots } from "@/features/agents/components/agent-activity";
import {
  extractArtifacts,
  hasArtifacts,
  type ReportArtifact,
} from "@/features/executions/result";
import { isActiveStatus } from "@/features/executions/labels";
import { formatBytes, formatExecutionDate } from "@/lib/format";
import type { ExecutionDetail } from "@/features/executions/types";

const ICON_CLASSES = "size-4 shrink-0 text-fg-muted";

function Block({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border px-[18px] py-4">
      <h3 className="flex items-center gap-2 text-xs font-medium text-fg-muted">
        {icon}
        {title}
        {count !== undefined && count > 1 && (
          <span className="font-mono tabular-nums">{count}</span>
        )}
      </h3>
      {children}
    </div>
  );
}

function ReportCard({ report }: { report: ReportArtifact }) {
  const previewHref = `/api/files/${report.fileId}/preview`;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-3 bg-surface-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{report.title || report.fileName}</p>
          <p className="truncate font-mono text-xs text-fg-muted">
            {report.fileName} · {formatBytes(report.sizeBytes)}
            {report.chartCount > 0 &&
              ` · ${report.chartCount} ${report.chartCount === 1 ? "chart" : "charts"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("ghost")}
          >
            <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
            Open
          </a>
          <a href={`/api/files/${report.fileId}/download`} className={buttonClasses("secondary")}>
            <Download className="size-4" strokeWidth={1.75} aria-hidden />
            Download
          </a>
        </div>
      </div>
      <iframe
        src={previewHref}
        title={`Preview of ${report.title || report.fileName}`}
        sandbox=""
        loading="lazy"
        className="block h-[480px] w-full border-t border-border bg-white"
      />
    </div>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function ExecutionResult({ execution }: { execution: ExecutionDetail }) {
  const artifacts = extractArtifacts(execution.steps);
  const answer = execution.result?.trim() ?? "";
  const active = isActiveStatus(execution.status);

  return (
    <section
      aria-labelledby="result-title"
      className="rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between gap-3 px-[18px] pt-[18px] pb-3">
        <h2 id="result-title" className="text-base font-semibold">
          Result
        </h2>
        {execution.status === "COMPLETED" && execution.finishedAt && (
          <span className="font-mono text-xs text-fg-muted">
            {formatExecutionDate(execution.finishedAt)}
          </span>
        )}
      </div>

      <div className="px-[18px] pb-[18px]">
        {answer ? (
          <Markdown>{answer}</Markdown>
        ) : active ? (
          <p className="flex items-center gap-2 text-[13px] text-fg-muted">
            The answer appears here when the agent finishes
            <ThinkingDots />
          </p>
        ) : (
          <p className="text-[13px] text-fg-muted">
            {execution.status === "CANCELLED"
              ? "The execution was cancelled before the agent answered."
              : "The agent did not produce an answer."}
          </p>
        )}
      </div>

      {hasArtifacts(artifacts) && (
        <>
          {artifacts.reports.length > 0 && (
            <Block
              icon={<FileChartColumn className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />}
              title="Reports"
              count={artifacts.reports.length}
            >
              <div className="flex flex-col gap-3">
                {artifacts.reports.map((report) => (
                  <ReportCard key={report.fileId} report={report} />
                ))}
              </div>
            </Block>
          )}

          {artifacts.emails.length > 0 && (
            <Block
              icon={<Mail className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />}
              title="Emails sent"
              count={artifacts.emails.length}
            >
              <ul className="flex flex-col gap-2">
                {artifacts.emails.map((email, index) => (
                  <li
                    key={`${email.to}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5"
                  >
                    <Send className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px]">
                        Sent to <span className="font-mono">{email.to}</span>
                      </p>
                      <p className="truncate text-[13px] text-fg-muted">{email.subject}</p>
                      {email.attachment && (
                        <p className="mt-1 flex items-center gap-1 font-mono text-xs text-fg-muted">
                          <Paperclip className="size-3.5" strokeWidth={1.75} aria-hidden />
                          {email.attachment}
                        </p>
                      )}
                    </div>
                    {email.sentAt && (
                      <span className="shrink-0 font-mono text-xs text-fg-muted">
                        {formatExecutionDate(email.sentAt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {artifacts.calculations.length > 0 && (
            <Block
              icon={<Calculator className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />}
              title="Calculations"
            >
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-[13px]">
                  <thead className="sr-only">
                    <tr>
                      <th>Name</th>
                      <th>Formula</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {artifacts.calculations.map((calculation) => (
                      <tr key={calculation.name}>
                        <td className="px-3 py-2 font-mono">{calculation.name}</td>
                        <td
                          className="hidden max-w-0 truncate px-3 py-2 font-mono text-xs text-fg-muted sm:table-cell sm:w-1/2"
                          title={calculation.expression}
                        >
                          {calculation.expression}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium tabular-nums">
                          {formatNumber(calculation.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
          )}

          {artifacts.answers.length > 0 && (
            <Block
              icon={
                <MessageCircleQuestionMark className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />
              }
              title="Your answers"
            >
              <dl className="flex flex-col gap-2 text-[13px]">
                {artifacts.answers.map((item, index) => (
                  <div key={index} className="rounded-lg bg-surface-2 px-3 py-2">
                    <dt className="text-fg-muted">{item.question}</dt>
                    <dd className="mt-0.5">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {artifacts.apiWrites.length > 0 && (
            <Block
              icon={<Plug className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />}
              title="Changes made through APIs"
            >
              <ul className="flex flex-col gap-1.5">
                {artifacts.apiWrites.map((write, index) => (
                  <li key={index} className="flex items-center gap-2 text-[13px]">
                    <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">
                      {write.method}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg-muted" title={write.url}>
                      {write.connection} · {write.url}
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        write.status < 400 ? "text-success" : "text-danger"
                      }`}
                    >
                      {write.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {artifacts.sources.length > 0 && (
            <Block
              icon={<Globe className={ICON_CLASSES} strokeWidth={1.75} aria-hidden />}
              title="Sources"
              count={artifacts.sources.length}
            >
              <ul className="flex flex-col gap-1">
                {artifacts.sources.map((source) => (
                  <li key={source.url} className="flex min-w-0 items-center gap-2 text-[13px]">
                    {source.kind === "web" ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-accent underline-offset-2 hover:underline"
                        title={source.url}
                      >
                        {source.label}
                      </a>
                    ) : (
                      <span className="truncate font-mono text-xs text-fg-muted" title={source.url}>
                        {source.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </>
      )}
    </section>
  );
}
