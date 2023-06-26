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
        label: 'Exposed',
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        data: createChartPoints(metrics, locationSettings, m => m.timings.yes),
        elements: {
            point: {
                radius: 2,
            },
        },
    };

    const noSeries = {
        label: 'Not exposed',
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        data: createChartPoints(metrics, locationSettings, m => m.timings.no),
        elements: {
            point: {
                radius: 2,
            },
        },
    };
    const diffSeries = {
        label: 'Difference',
        borderColor: '#FFA500',
        backgroundColor: '#FFA500',
        data: createChartPoints(
            metrics,
            locationSettings,
            m => m.timings.yes - m.timings.no
        ),
        elements: {
            point: {
                radius: 2,
                // pointStyle: 'triangle',
                // pointRotation: 180,
            },
        },
    };

    return {
        datasets: [yesSeries, noSeries, diffSeries],
    };
};

const createChartPoints = (
    metrics: IFeatureMetricsRaw[],
    locationSettings: ILocationSettings,
    y: (m: IFeatureMetricsRaw) => number
): IPoint[] => {
    return metrics.map(metric => ({
        x: metric.timestamp,
        y: y(metric),
        variants: metric.variants,
        timings: metric.timings,
    }));
};
