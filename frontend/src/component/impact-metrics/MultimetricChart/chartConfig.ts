import { Chart as ChartJS, type ChartOptions } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
    getDisplayFormat,
    getTimeUnit,
    formatLargeNumbers,
} from '../metricsFormatters.js';
import type { MultimetricStepSeries } from './types';

ChartJS.register(annotationPlugin);

export const withAlpha = (hex: string, alpha: number): string => {
    const stripped = hex.replace('#', '');
    const red = parseInt(stripped.slice(0, 2), 16);
    const green = parseInt(stripped.slice(2, 4), 16);
    const blue = parseInt(stripped.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export type VisibleWindow = {
    minMs: number;
    maxMs: number;
    rangeMs: number;
};

// Parses the Unix-second `start`/`end` strings into a millisecond window.
// Returns `null` only if the range is non-positive (malformed input) — callers
// use that as the signal to skip window-dependent rendering.
export const parseVisibleWindow = (
    start: string,
    end: string,
): VisibleWindow | null => {
    const minMs = Number.parseInt(start, 10) * 1000;
    const maxMs = Number.parseInt(end, 10) * 1000;
    const rangeMs = maxMs - minMs;
    if (rangeMs <= 0) return null;
    return { minMs, maxMs, rangeMs };
};

// Transforms raw step series into the `{ labels, datasets }` shape Chart.js
// expects.
export const buildTimeSeriesChartData = (
    stepSeries: MultimetricStepSeries[],
    colors: readonly string[],
    hiddenSteps: Set<number>,
) => {
    const allTimestamps = new Set<number>();
    stepSeries.forEach((step) => {
        step.data.forEach(([timestamp]) => {
            allTimestamps.add(timestamp);
        });
    });
    const sortedTimestamps = Array.from(allTimestamps).sort(
        (earlier, later) => earlier - later,
    );
    const labels = sortedTimestamps.map(
        (timestamp) => new Date(timestamp * 1000),
    );

    const datasets = stepSeries.map((step, index) => {
        const valueByTimestamp = new Map(step.data);
        const values = sortedTimestamps.map(
            (timestamp) => valueByTimestamp.get(timestamp) ?? null,
        );
        const color = colors[index % colors.length];
        return {
            label: step.label,
            data: values,
            hidden: hiddenSteps.has(index),
            borderColor: color,
            backgroundColor: withAlpha(color, 0.12),
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.2,
            spanGaps: true,
        };
    });

    return { labels, datasets };
};

export type ChartTimeRange = 'hour' | 'day' | 'week' | 'month';

// Builds the Chart.js options for the line chart. Pure config — no React.
export const buildChartOptions = (
    visibleWindow: VisibleWindow | null,
    timeRange: ChartTimeRange,
    eventAnnotations: Record<string, object>,
): ChartOptions<'line'> => ({
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 28, right: 4, left: 4 } },
    scales: {
        x: {
            type: 'time' as const,
            min: visibleWindow?.minMs,
            max: visibleWindow?.maxMs,
            time: {
                unit: getTimeUnit(timeRange),
                displayFormats: {
                    [getTimeUnit(timeRange)]: getDisplayFormat(timeRange),
                },
                tooltipFormat: 'PPpp',
            },
            ticks: {
                maxRotation: 0,
                maxTicksLimit: 6,
                font: { size: 10 },
            },
            grid: { display: false },
        },
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
                maxTicksLimit: 4,
                font: { size: 10 },
                callback: (value: unknown): string | number =>
                    typeof value === 'number'
                        ? formatLargeNumbers(value)
                        : (value as number),
            },
        },
    },
    plugins: {
        legend: { display: false },
        annotation: { annotations: eventAnnotations },
    } as ChartOptions<'line'>['plugins'],
    animations: {
        x: { duration: 0 },
        y: { duration: 0 },
    },
});
