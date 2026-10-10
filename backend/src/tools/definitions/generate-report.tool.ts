import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { defineTool } from '../tool-definition.js';

export const generateReportTool = defineTool({
  name: 'generateReport',
  description:
    'Formats findings into a structured Markdown report. Use it for the final deliverable when the user asks for a report. Only include facts taken from tool results.',
  inputSchema: z.object({
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(2_000),
    sections: z
      .array(
        z.object({
          heading: z.string().min(1).max(200),
          content: z.string().min(1).max(10_000),
        }),
      )
      .min(1)
      .max(20),
  }),
  outputSchema: z.object({
    reportId: z.string(),
    title: z.string(),
    fileName: z.string(),
    markdown: z.string(),
    createdAt: z.iso.datetime(),
  }),
  permission: { resource: 'reports', action: 'create' },
  requiresApproval: false,
  execute: async ({ title, summary, sections }) => {
    const markdown = [
      `# ${title}`,
      '',
      summary,
      ...sections.flatMap((section) => [
        '',
        `## ${section.heading}`,
        '',
        section.content,
      ]),
    ].join('\n');
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      reportId: randomUUID(),
      title,
      fileName: `${slug || 'report'}.md`,
      markdown,
      createdAt: new Date().toISOString(),
    };
  },
});
