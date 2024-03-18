import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';

// multiple applications may have metrics for the same timestamp
export const aggregateFeatureMetrics = (
    metrics: IFeatureMetricsRaw[],
): IFeatureMetricsRaw[] => {
    const resultMap = new Map<string, IFeatureMetricsRaw>();

    metrics.forEach((obj) => {
        let aggregated = resultMap.get(obj.timestamp);
        if (!aggregated) {
            aggregated = { ...obj, yes: 0, no: 0, variants: {} };
            resultMap.set(obj.timestamp, aggregated);
        }

        aggregated.yes += obj.yes;
        aggregated.no += obj.no;

        if (obj.variants) {
            aggregated.variants = aggregated.variants || {};
            for (const [key, value] of Object.entries(obj.variants)) {
                aggregated.variants[key] =
                    (aggregated.variants[key] || 0) + value;
            }
        }
    });

    return Array.from(resultMap.values()).map((item) => ({
        ...item,
        variants:
            item.variants && Object.keys(item.variants).length === 0
                ? undefined
                : item.variants,
    }));
};
