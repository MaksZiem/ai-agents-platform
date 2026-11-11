import { z } from 'zod';

export const chartSchema = z
  .object({
    type: z.enum(['bar', 'line']),
    title: z.string().min(1).max(200),
    unit: z.string().max(20).optional(),
    labels: z.array(z.string().min(1).max(40)).min(1).max(24),
    series: z
      .array(
        z.object({
          name: z.string().min(1).max(60),
          values: z.array(z.number()),
        }),
      )
      .min(1)
      .max(4),
  })
  .refine(
    (chart) =>
      chart.series.every(
        (series) => series.values.length === chart.labels.length,
      ),
    { message: 'Every series needs exactly one value per label' },
  );

export type Chart = z.infer<typeof chartSchema>;

const WIDTH = 640;
const HEIGHT = 320;
const PLOT = { left: 64, right: 16, top: 16, bottom: 56 };
const COLORS = ['#2563eb', '#ea580c', '#16a34a', '#9333ea'];
const TICK_COUNT = 5;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function niceStep(range: number): number {
  const rough = range / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
}

function formatTick(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1e9) return `${+(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${+(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e4) return `${+(value / 1e3).toFixed(1)}k`;

  return `${+value.toFixed(2)}`;
}

function scaleFor(values: number[]) {
  const dataMin = Math.min(0, ...values);
  const dataMax = Math.max(0, ...values);
  const step = niceStep(dataMax - dataMin || 1);
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step || step;
  const height = HEIGHT - PLOT.top - PLOT.bottom;
  const ticks: number[] = [];

  for (let tick = min; tick <= max + step / 2; tick += step) {
    ticks.push(Math.round(tick / step) * step);
  }

  return {
    ticks,
    y: (value: number) => PLOT.top + ((max - value) / (max - min)) * height,
  };
}

export function renderChartSvg(chart: Chart): string {
  const values = chart.series.flatMap((series) => series.values);
  const { ticks, y } = scaleFor(values);
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const slot = plotWidth / chart.labels.length;
  const x = (index: number) => PLOT.left + slot * index + slot / 2;
  const unit = chart.unit ? ` ${escapeXml(chart.unit)}` : '';
  const parts: string[] = [];

  for (const tick of ticks) {
    parts.push(
      `<line x1="${PLOT.left}" x2="${WIDTH - PLOT.right}" y1="${y(tick)}" y2="${y(tick)}" stroke="${tick === 0 ? '#9ca3af' : '#e5e7eb'}"/>`,
      `<text x="${PLOT.left - 8}" y="${y(tick) + 4}" text-anchor="end" font-size="11" fill="#6b7280">${formatTick(tick)}</text>`,
    );
  }

  chart.labels.forEach((label, index) => {
    parts.push(
      `<text x="${x(index)}" y="${HEIGHT - PLOT.bottom + 18}" text-anchor="middle" font-size="11" fill="#374151">${escapeXml(label)}</text>`,
    );
  });

  if (chart.type === 'bar') {
    const groupWidth = slot * 0.7;
    const barWidth = groupWidth / chart.series.length;

    chart.series.forEach((series, seriesIndex) => {
      series.values.forEach((value, index) => {
        const left = x(index) - groupWidth / 2 + barWidth * seriesIndex;
        const top = Math.min(y(value), y(0));
        const height = Math.abs(y(value) - y(0));

        parts.push(
          `<rect x="${left}" y="${top}" width="${Math.max(barWidth - 2, 1)}" height="${height}" fill="${COLORS[seriesIndex]}"><title>${escapeXml(series.name)} · ${escapeXml(chart.labels[index])}: ${value}${unit}</title></rect>`,
        );
      });
    });
  } else {
    chart.series.forEach((series, seriesIndex) => {
      const points = series.values
        .map((value, index) => `${x(index)},${y(value)}`)
        .join(' ');

      parts.push(
        `<polyline points="${points}" fill="none" stroke="${COLORS[seriesIndex]}" stroke-width="2"/>`,
        ...series.values.map(
          (value, index) =>
            `<circle cx="${x(index)}" cy="${y(value)}" r="3.5" fill="${COLORS[seriesIndex]}"><title>${escapeXml(series.name)} · ${escapeXml(chart.labels[index])}: ${value}${unit}</title></circle>`,
        ),
      );
    });
  }

  let legendX = PLOT.left;
  chart.series.forEach((series, seriesIndex) => {
    parts.push(
      `<rect x="${legendX}" y="${HEIGHT - 20}" width="10" height="10" fill="${COLORS[seriesIndex]}"/>`,
      `<text x="${legendX + 14}" y="${HEIGHT - 11}" font-size="11" fill="#374151">${escapeXml(series.name)}</text>`,
    );
    legendX += 24 + series.name.length * 6.5;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(chart.title)}" font-family="system-ui, sans-serif">${parts.join('')}</svg>`;
}
