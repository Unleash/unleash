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
    return `${config.timeRange}::${config.aggregationMode}::${config.yAxisMin}::${JSON.stringify(sortedLabels)}`;
}

// Partitions groups so multi-config groups render before solos. Keeps
// the original insertion order within each partition, so grouping remains
// deterministic.
export function multimetricFirst(groups: ConfigGroup[]): ConfigGroup[] {
    const multimetric = groups.filter((group) => group.configs.length >= 2);
    const solo = groups.filter((group) => group.configs.length < 2);
    return [...multimetric, ...solo];
}

export function groupImpactConfigs(
    configs: ImpactMetricsConfigSchema[],
): ConfigGroup[] {
    const groups = new Map<string, ConfigGroup>();

    for (const config of configs) {
        // Safeguard charts (mode === 'read') should always render as
        // standalone cards so the shield icon and individual value remain
        // visible.
        if (config.mode === 'read') {
            const soloKey = `solo::${config.id}`;
            groups.set(soloKey, {
                key: soloKey,
                timeRange: config.timeRange as ChartTimeRange,
                aggregationMode: config.aggregationMode,
                labelSelectors: config.labelSelectors,
                configs: [config],
            });
            continue;
        }

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
