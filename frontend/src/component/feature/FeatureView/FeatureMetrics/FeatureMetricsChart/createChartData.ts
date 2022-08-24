import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { ChartData } from 'chart.js';
import { ILocationSettings } from 'hooks/useLocationSettings';
import theme from 'themes/theme';
import 'chartjs-adapter-date-fns';

interface IPoint {
    x: string;
    y: number;
}

export const createChartData = (
    metrics: IFeatureMetricsRaw[],
    locationSettings: ILocationSettings
): ChartData<'line', IPoint[], string> => {
    const requestsSeries = {
        label: 'total requests',
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
        label: 'exposed',
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
        label: 'not exposed',
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

    return { datasets: [yesSeries, noSeries, requestsSeries] };
};

const createChartPoints = (
    metrics: IFeatureMetricsRaw[],
    locationSettings: ILocationSettings,
    y: (m: IFeatureMetricsRaw) => number
): IPoint[] => {
    return metrics.map(metric => ({
        x: metric.timestamp,
        y: y(metric),
    }));
};
