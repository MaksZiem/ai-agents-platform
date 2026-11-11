import { Marked } from 'marked';
import { type Chart, escapeXml, renderChartSvg } from './charts.js';

export interface ReportSection {
  heading: string;
  content: string;
  charts?: Chart[];
}

export interface Report {
  title: string;
  summary: string;
  sections: ReportSection[];
  generatedAt: Date;
}

const markdown = new Marked({
  gfm: true,
  renderer: {
    html: ({ text }) => escapeXml(text),
  },
});

const STYLES = `
body{margin:0;background:#f9fafb;color:#111827;font:15px/1.6 system-ui,-apple-system,sans-serif}
main{max-width:760px;margin:0 auto;padding:40px 24px;background:#fff;min-height:100vh;box-sizing:border-box}
h1{font-size:28px;line-height:1.25;margin:0 0 4px}
.meta{color:#6b7280;font-size:13px;margin:0 0 24px}
.summary{border-left:3px solid #2563eb;background:#eff6ff;padding:12px 16px;margin:0 0 32px}
h2{font-size:19px;margin:32px 0 8px;padding-top:16px;border-top:1px solid #e5e7eb}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px}
th,td{border:1px solid #e5e7eb;padding:6px 10px;text-align:left}
th{background:#f3f4f6}
td:not(:first-child){font-variant-numeric:tabular-nums}
figure{margin:20px 0}
figcaption{font-weight:600;font-size:14px;margin-bottom:6px}
svg{width:100%;height:auto}
code{background:#f3f4f6;padding:1px 4px;border-radius:4px}
@media print{body{background:#fff}main{padding:0}}
`;

function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false });
}

function renderChart(chart: Chart): string {
  return `<figure><figcaption>${escapeXml(chart.title)}</figcaption>${renderChartSvg(chart)}</figure>`;
}

export function renderReportHtml(report: Report): string {
  const sections = report.sections
    .map(
      (section) =>
        `<section><h2>${escapeXml(section.heading)}</h2>${renderMarkdown(section.content)}${(section.charts ?? []).map(renderChart).join('')}</section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<title>${escapeXml(report.title)}</title>
<style>${STYLES}</style>
</head>
<body>
<main>
<h1>${escapeXml(report.title)}</h1>
<p class="meta">Generated ${escapeXml(report.generatedAt.toISOString().slice(0, 16).replace('T', ' '))} UTC</p>
<div class="summary">${renderMarkdown(report.summary)}</div>
${sections}
</main>
</body>
</html>
`;
}
