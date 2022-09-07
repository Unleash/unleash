import { IClientMetricsEnv } from '../types/stores/client-metrics-store-v2';
import { startOfHour } from 'date-fns';

const createMetricKey = (metric: IClientMetricsEnv): string => {
    return [
        metric.featureName,
        metric.appName,
        metric.environment,
        metric.timestamp.getTime(),
    ].join();
};

export const collapseHourlyMetrics = (
    metrics: IClientMetricsEnv[],
): IClientMetricsEnv[] => {
    const grouped = new Map<string, IClientMetricsEnv>();
    metrics.forEach((metric) => {
        const hourlyMetric = {
            ...metric,
            timestamp: startOfHour(metric.timestamp),
        };
        const key = createMetricKey(hourlyMetric);
        if (!grouped[key]) {
            grouped[key] = hourlyMetric;
        } else {
            grouped[key].yes = metric.yes + (grouped[key].yes || 0);
            grouped[key].no = metric.no + (grouped[key].no || 0);
        }
    });
    return Object.values(grouped);
};
