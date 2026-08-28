import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import type { ChartData } from 'chart.js';
import type { ILocationSettings } from 'hooks/useLocationSettings';
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
    locationSettings: ILocationSettings,
): ChartData<'bar', IPoint[], string> => {
    const yesSeries = {
        label: 'Enabled',
        borderColor: theme.palette.charts.flagMetrics.enabled,
        backgroundColor: theme.palette.charts.flagMetrics.enabled,
        data: createChartPoints(metrics, locationSettings, (m) => m.yes),
    };

    const noSeries = {
        label: 'Not enabled',
        borderColor: theme.palette.charts.flagMetrics.notEnabled,
        backgroundColor: theme.palette.charts.flagMetrics.notEnabled,
        data: createChartPoints(metrics, locationSettings, (m) => m.no),
    };

    return {
        datasets: [yesSeries, noSeries],
    };
};

const createChartPoints = (
    metrics: IFeatureMetricsRaw[],
    _locationSettings: ILocationSettings,
    y: (m: IFeatureMetricsRaw) => number,
): IPoint[] => {
    return metrics.map((metric) => ({
        x: metric.timestamp,
        y: y(metric),
        variants: metric.variants || {},
    }));
};
