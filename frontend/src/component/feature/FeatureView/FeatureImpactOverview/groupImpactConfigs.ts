import type { ImpactMetricsConfigSchema } from 'openapi';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';

export type ConfigGroup = {
    key: string;
    timeRange: ChartTimeRange;
    aggregationMode: string;
    labelSelectors: Record<string, string[]>;
    configs: ImpactMetricsConfigSchema[];
};

function buildGroupKey(config: ImpactMetricsConfigSchema): string {
    const sortedLabels: Record<string, string[]> = {};
    for (const key of Object.keys(config.labelSelectors).sort()) {
        sortedLabels[key] = [...config.labelSelectors[key]].sort();
    }
    return `${config.timeRange}::${config.aggregationMode}::${JSON.stringify(sortedLabels)}`;
}

export function groupImpactConfigs(
    configs: ImpactMetricsConfigSchema[],
): ConfigGroup[] {
    const groups = new Map<string, ConfigGroup>();

    for (const config of configs) {
        const key = buildGroupKey(config);
        const existing = groups.get(key);
        if (existing) {
            existing.configs.push(config);
        } else {
            groups.set(key, {
                key,
                timeRange: config.timeRange as ChartTimeRange,
                aggregationMode: config.aggregationMode,
                labelSelectors: config.labelSelectors,
                configs: [config],
            });
        }
    }

    return Array.from(groups.values());
}
