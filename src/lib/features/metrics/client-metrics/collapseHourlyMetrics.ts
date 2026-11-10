import type {
    IClientMetricsEnv,
    IClientMetricsEnvVariant,
} from './client-metrics-store-v2-type.js';
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

    // Variant names are client-supplied, so only look at own properties;
    // names like "toString" would otherwise resolve to inherited functions.
    for (const key of Object.keys(firstRecord)) {
        result[key] =
            firstRecord[key] +
            (Object.hasOwn(secondRecord, key) ? secondRecord[key] : 0);
    }

    for (const key of Object.keys(secondRecord)) {
        if (!Object.hasOwn(result, key)) {
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
        const existing = grouped.get(key);
        if (!existing) {
            grouped.set(key, hourlyMetric);
        } else {
            existing.yes = metric.yes + (existing.yes || 0);
            existing.no = metric.no + (existing.no || 0);

            if (metric.variants) {
                existing.variants = mergeRecords(
                    metric.variants,
                    existing.variants ?? {},
                );
            }
        }
    });
    return [...grouped.values()];
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
