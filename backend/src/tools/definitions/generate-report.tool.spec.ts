import type { ToolContext, ToolFileInput } from '../tool-definition.js';
import { chartSchema } from '../charts.js';
import { generateReportTool } from './generate-report.tool.js';

function createContext() {
  const saved: ToolFileInput[] = [];
  const context = {
    saveFile: async (file: ToolFileInput) => {
      saved.push(file);
      return { id: 'file-1', name: file.name, sizeBytes: file.content.length };
    },
  } as unknown as ToolContext;

  return { context, saved };
}

describe('generateReport', () => {
  it('saves an HTML report with charts and escapes raw HTML', async () => {
    const { context, saved } = createContext();

    const result = await generateReportTool.execute(
      {
        title: 'Q4 Forecast',
        summary: 'Revenue grows **12%**.',
        sections: [
          {
            heading: 'Revenue <script>',
            content:
              '| Quarter | Revenue |\n| --- | --- |\n| Q3 | 500 |\n\n<script>alert(1)</script>',
            charts: [
              {
                type: 'bar',
                title: 'Revenue by quarter',
                unit: 'kEUR',
                labels: ['Q3', 'Q4'],
                series: [
                  { name: 'Actual', values: [500, 0] },
                  { name: 'Forecast', values: [0, 560] },
                ],
              },
              {
                type: 'line',
                title: 'Trend',
                labels: ['Jan', 'Feb', 'Mar'],
                series: [{ name: 'Costs', values: [-20, 10, 40] }],
              },
            ],
          },
        ],
      },
      context,
    );

    const html = saved[0].content;

    expect(result).toMatchObject({
      fileId: 'file-1',
      fileName: 'q4-forecast.html',
      chartCount: 2,
    });
    expect(saved[0].mimeType).toBe('text/html');
    expect(html).toContain('<strong>12%</strong>');
    expect(html).toContain('<table>');
    expect(html.match(/<svg /g)).toHaveLength(2);
    expect(html).toContain('<polyline');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Revenue &lt;script&gt;');
    expect(html).toContain("default-src 'none'");
    expect(generateReportTool.outputSchema.parse(result)).toEqual(result);
  });

  it('rejects a chart whose series does not match the labels', () => {
    const parsed = chartSchema.safeParse({
      type: 'bar',
      title: 'Broken',
      labels: ['Q1', 'Q2'],
      series: [{ name: 'Revenue', values: [1] }],
    });

    expect(parsed.success).toBe(false);
  });
});
