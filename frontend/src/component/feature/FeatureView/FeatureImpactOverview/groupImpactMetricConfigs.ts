import type { ImpactMetricsConfigSchema } from 'openapi';

type Result = {
    groups: ImpactMetricsConfigSchema[][];
    singletons: ImpactMetricsConfigSchema[];
};

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

export const groupImpactMetricConfigs = (
    configs: ImpactMetricsConfigSchema[],
    enabled: boolean,
): Result => {
    if (!enabled) {
        return { groups: [], singletons: configs };
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

    const groups: ImpactMetricsConfigSchema[][] = [];
    const singletons: ImpactMetricsConfigSchema[] = [];

    for (const key of bucketOrder) {
        const bucket = buckets.get(key)!;
        if (bucket.length >= 2) {
            groups.push(bucket);
        } else {
            singletons.push(bucket[0]);
        }
    }

    return { groups, singletons };
};
