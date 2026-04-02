import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import type { ChartData } from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { Theme } from '@mui/material/styles/createTheme';

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
        label: 'Exposed',
        hoverBackgroundColor: theme.palette.charts.flagMetrics.exposed,
        backgroundColor: theme.palette.charts.flagMetrics.exposed,
        data: createChartPoints(metrics, (m) => m.yes),
    };

    const noSeries = {
        label: 'Not exposed',
        hoverBackgroundColor: theme.palette.charts.flagMetrics.notExposed,
        backgroundColor: theme.palette.charts.flagMetrics.notExposed,
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
