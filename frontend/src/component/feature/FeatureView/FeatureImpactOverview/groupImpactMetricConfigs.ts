import type { ImpactMetricsConfigSchema } from 'openapi';

const canonicalLabels = (
    labelSelectors: ImpactMetricsConfigSchema['labelSelectors'],
): Array<[string, string[]]> =>
    Object.keys(labelSelectors)
        .sort()
        .map((key) => [
            key,
            Array.from(new Set(labelSelectors[key])).sort(),
        ]);

const equalityKey = (config: ImpactMetricsConfigSchema): string =>
    JSON.stringify({
        timeRange: config.timeRange,
        aggregationMode: config.aggregationMode,
        yAxisMin: config.yAxisMin,
        mode: config.mode ?? null,
        labelSelectors: canonicalLabels(config.labelSelectors),
    });

/**
 * Buckets configs by their equality key (everything except id, metricName,
 * displayName, title, source). Buckets are returned in first-occurrence
 * order of their head. When disabled, every config becomes its own bucket.
 */
export const groupImpactMetricConfigs = (
    configs: ImpactMetricsConfigSchema[],
    enabled: boolean,
): ImpactMetricsConfigSchema[][] => {
    if (!enabled) {
        return configs.map((config) => [config]);
    }

    const buckets = new Map<string, ImpactMetricsConfigSchema[]>();
    const bucketOrder: string[] = [];

    for (const config of configs) {
        const key = equalityKey(config);
        if (!buckets.has(key)) {
            buckets.set(key, []);
            bucketOrder.push(key);
        }
        buckets.get(key)!.push(config);
    }

    return bucketOrder.map((key) => buckets.get(key)!);
};
