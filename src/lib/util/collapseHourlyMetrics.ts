import {
    IClientMetricsEnv,
    IClientMetricsEnvVariant,
} from '../types/stores/client-metrics-store-v2';
import { startOfHour } from 'date-fns';

const createMetricKey = (metric: IClientMetricsEnv): string => {
    return [
        metric.featureName,
        metric.appName,
        metric.environment,
        metric.timestamp.getTime(),
    ].join();
};

const mergeRecords = (
    firstRecord: Record<string, number>,
    secondRecord: Record<string, number>,
): Record<string, number> => {
    const result: Record<string, number> = {};

    for (const key in firstRecord) {
        result[key] = firstRecord[key] + (secondRecord[key] ?? 0);
    }

    for (const key in secondRecord) {
        if (!(key in result)) {
            result[key] = secondRecord[key];
        }
    }

    return result;
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

            if (metric.variants) {
                grouped[key].variants = mergeRecords(
                    metric.variants,
                    grouped[key].variants ?? {},
                );
            }
        }
    });
    return Object.values(grouped);
};

export const spreadVariants = (
    metrics: IClientMetricsEnv[],
): IClientMetricsEnvVariant[] => {
    return metrics.flatMap((item) => {
        if (!item.variants) {
            return [];
        }
        return Object.entries(item.variants).map(([variant, count]) => ({
            featureName: item.featureName,
            appName: item.appName,
            environment: item.environment,
            timestamp: item.timestamp,
            variant,
            count,
        }));
    });
};
