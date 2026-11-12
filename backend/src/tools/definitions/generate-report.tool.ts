import { z } from 'zod';
import { chartSchema } from '../charts.js';
import { renderReportHtml } from '../report-html.js';
import { defineTool } from '../tool-definition.js';

export const generateReportTool = defineTool({
  name: 'generateReport',
  summary: 'Creates an HTML report with tables and charts.',
  category: 'analysis',
  description:
    'Builds the final report as a self-contained HTML file with optional charts and saves it as a downloadable file. Section content is Markdown (paragraphs, lists, bold, tables). Each section can have charts: type "bar" for comparing categories or periods, "line" for trends over time; give one label per period/category and one value per label in every series. Only include facts and numbers taken from tool results, and mark forecasts and assumptions as such. Returns fileId, which sendEmail accepts as attachmentFileId.',
  inputSchema: z.object({
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(2_000),
    sections: z
      .array(
        z.object({
          heading: z.string().min(1).max(200),
          content: z.string().min(1).max(10_000),
          charts: z.array(chartSchema).max(3).optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
  outputSchema: z.object({
    fileId: z.string(),
    title: z.string(),
    fileName: z.string(),
    sizeBytes: z.number(),
    chartCount: z.number(),
    createdAt: z.iso.datetime(),
  }),
  permission: { resource: 'reports', action: 'create' },
  requiresApproval: false,
  execute: async ({ title, summary, sections }, context) => {
    const generatedAt = new Date();
    const html = renderReportHtml({ title, summary, sections, generatedAt });
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const file = await context.saveFile({
      name: `${slug || 'report'}.html`,
      mimeType: 'text/html',
      content: html,
    });

    return {
      fileId: file.id,
      title,
      fileName: file.name,
      sizeBytes: file.sizeBytes,
      chartCount: sections.reduce(
        (total, section) => total + (section.charts?.length ?? 0),
        0,
      ),
      createdAt: generatedAt.toISOString(),
    };
  },
});
