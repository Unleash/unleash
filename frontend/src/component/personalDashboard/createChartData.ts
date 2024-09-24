import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import type { ChartData } from 'chart.js';
import 'chartjs-adapter-date-fns';

export interface IPoint {
    x: string;
    y: number;
    variants: Record<string, number>;
}

export const createChartData = (
    metrics: IFeatureMetricsRaw[],
): ChartData<'bar', IPoint[], string> => {
    const yesSeries = {
        label: 'Exposed',
        hoverBackgroundColor: '#A39EFF',
        backgroundColor: '#A39EFF',
        data: createChartPoints(metrics, (m) => m.yes),
    };

    const noSeries = {
        label: 'Not exposed',
        hoverBackgroundColor: '#D8D6FF',
        backgroundColor: '#D8D6FF',
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
