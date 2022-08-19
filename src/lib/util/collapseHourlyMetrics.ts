import { IClientMetricsEnv } from '../types/stores/client-metrics-store-v2';
import { startOfHour } from 'date-fns';

const groupBy = <T>(list: T[], createKey: (item: T) => string): T[][] => {
    const groups = list.reduce((acc, item) => {
        const key = createKey(item);
        acc[key] = acc[key] ?? [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, T[]>);

    return Object.values(groups);
};

const createMetricKey = (metric: IClientMetricsEnv): string => {
    return [
        metric.featureName,
        metric.appName,
        metric.environment,
        metric.timestamp.getTime(),
    ].join();
};

const sumYesNo = (
    metrics: IClientMetricsEnv[],
): Pick<IClientMetricsEnv, 'yes' | 'no'> => {
    return metrics.reduce(
        (acc, metric) => ({
            yes: acc.yes + metric.yes,
            no: acc.no + metric.no,
        }),
        {
            yes: 0,
            no: 0,
        },
    );
};

export const collapseHourlyMetrics = (
    metrics: IClientMetricsEnv[],
): IClientMetricsEnv[] => {
    const hourlyMetrics = metrics.map((metric) => ({
        ...metric,
        timestamp: startOfHour(metric.timestamp),
    }));

    return groupBy(hourlyMetrics, createMetricKey).flatMap((group) => ({
        ...group[0],
        ...sumYesNo(group),
    }));
};
