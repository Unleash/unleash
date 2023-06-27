import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { ChartData } from 'chart.js';
import { ILocationSettings } from 'hooks/useLocationSettings';
import 'chartjs-adapter-date-fns';
import { Theme } from '@mui/material/styles/createTheme';

export interface IPoint {
    x: string;
    y: number;
    variants: Record<string, number>;
}

export const createChartData = (
    theme: Theme,
    metrics: IFeatureMetricsRaw[],
    locationSettings: ILocationSettings
): ChartData<'line', IPoint[], string> => {
    const yesSeries = {
        label: 'CPU (%)',
        yAxis: 'y',
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        data: createChartPoints(metrics, locationSettings, m => m.timings.cpu),
        elements: {
            point: {
                radius: 2,
            },
        },
    };

    const noSeries = {
        label: 'Memory (MB)',
        borderColor: theme.palette.error.main,
        yAxisID: 'y2',
        backgroundColor: theme.palette.error.main,
        data: createChartPoints(
            metrics,
            locationSettings,
            m => m.timings.memory
        ),
        elements: {
            point: {
                radius: 2,
            },
        },
    };

    const changeSeries = {
        label: 'Configuration change',
        borderColor: theme.palette.error.main,
        borderWidth: 0,
        yAxisID: 'y3',
        backgroundColor: theme.palette.error.main,
        data: createChartPoints(metrics, locationSettings, m =>
            m.timings.change === 1 ? 'CHANGED' : NaN
        ),
        elements: {
            point: {
                radius: 5,
                hoverRadius: 8,
            },
        },
    };

    return {
        datasets: [yesSeries, noSeries, changeSeries],
    };
};

const createChartPoints = (
    metrics: IFeatureMetricsRaw[],
    locationSettings: ILocationSettings,
    y: (m: IFeatureMetricsRaw) => number
): IPoint[] => {
    return metrics.map(metric => ({
        x: metric.timestamp,
        y: y ? y(metric) : NaN,
        variants: metric.variants,
        timings: metric.timings,
    }));
};
