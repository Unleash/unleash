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
    const requestsSeries = {
        label: 'Total requests',
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        data: createChartPoints(metrics, locationSettings, m => m.yes + m.no),
        elements: {
            point: {
                radius: 6,
                pointStyle: 'circle',
            },
            line: {
                borderDash: [8, 4],
            },
        },
    };

    const yesSeries = {
        label: 'Exposed',
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        data: createChartPoints(metrics, locationSettings, m => m.yes),
        elements: {
            point: {
                radius: 6,
                pointStyle: 'triangle',
            },
        },
    };

    const noSeries = {
        label: 'Not exposed',
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        data: createChartPoints(metrics, locationSettings, m => m.no),
        elements: {
            point: {
                radius: 6,
                pointStyle: 'triangle',
                pointRotation: 180,
            },
        },
    };

    return {
        datasets: [yesSeries, noSeries, requestsSeries],
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
    }));
};
