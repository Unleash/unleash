import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import type { ChartData } from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { Theme } from '@mui/material/styles';

export interface IPoint {
    x: string;
    y: number;
    variants: Record<string, number>;
}

export const createChartData = (
    theme: Theme,
    metrics: IFeatureMetricsRaw[],
): ChartData<'bar', IPoint[], string> => {
    const yesSeries = {
        label: 'Enabled',
        hoverBackgroundColor: theme.palette.charts.flagMetrics.enabled,
        backgroundColor: theme.palette.charts.flagMetrics.enabled,
        data: createChartPoints(metrics, (m) => m.yes),
    };

    const noSeries = {
        label: 'Not enabled',
        hoverBackgroundColor: theme.palette.charts.flagMetrics.notEnabled,
        backgroundColor: theme.palette.charts.flagMetrics.notEnabled,
        data: createChartPoints(metrics, (m) => m.no),
    };

    return {
        datasets: [yesSeries, noSeries],
    };
};

const createChartPoints = (
    metrics: IFeatureMetricsRaw[],
    y: (m: IFeatureMetricsRaw) => number,
): IPoint[] => {
    return metrics.map((metric) => ({
        x: metric.timestamp,
        y: y(metric),
        variants: metric.variants || {},
    }));
};
