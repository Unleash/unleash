import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { ImpactMetricsConfigSchema } from 'openapi';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import type { ImpactMetricsResponse } from './useImpactMetricsData';
import { sumSeriesByTimestamp } from './sumSeriesByTimestamp';

const SUM_MODES = new Set(['count', 'sum']);

function aggregateTotal(
    points: ReadonlyArray<[number, number]>,
    aggregationMode: string,
): number {
    if (points.length === 0) return 0;
    if (SUM_MODES.has(aggregationMode)) {
        return points.reduce((sum, [, value]) => sum + value, 0);
    }
    return points[points.length - 1][1];
}

function buildPath(config: ImpactMetricsConfigSchema): string {
    const params = new URLSearchParams({
        metricName: config.metricName,
        range: config.timeRange,
        aggregationMode: config.aggregationMode,
        source: config.source ?? 'internal',
        mode: 'display',
    });

    if (Object.keys(config.labelSelectors).length > 0) {
        const labelsParam = Object.entries(config.labelSelectors).reduce(
            (acc, [key, values]) => {
                if (values.length > 0) {
                    acc[key] = values;
                }
                return acc;
            },
            {} as Record<string, string[]>,
        );

        if (Object.keys(labelsParam).length > 0) {
            params.append('labels', JSON.stringify(labelsParam));
        }
    }

    return `api/admin/impact-metrics/?${params.toString()}`;
}

export type GroupedImpactMetricsResult = {
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    start: string;
    end: string;
    loading: boolean;
};

export const useGroupedImpactMetricsData = (
    configs: ImpactMetricsConfigSchema[],
): GroupedImpactMetricsResult => {
    const paths = configs.map(buildPath);

    const cacheKey =
        configs.length > 0
            ? ['grouped-impact-metrics', ...paths.slice().sort()]
            : null;

    const { data, isLoading } = useSWR<ImpactMetricsResponse[]>(
        cacheKey,
        async () => {
            const responses = await Promise.all(
                paths.map(async (path) => {
                    const res = await fetch(formatApiPath(path));
                    if (!res.ok) {
                        throw new Error(
                            `Failed to fetch impact metrics: ${res.status}`,
                        );
                    }
                    return (await res.json()) as ImpactMetricsResponse;
                }),
            );
            return responses;
        },
        {
            refreshInterval: 30_000,
            revalidateOnFocus: true,
        },
    );

    if (!data || data.length === 0) {
        return {
            stepSeries: [],
            stepTotals: [],
            start: '',
            end: '',
            loading: isLoading,
        };
    }

    // Merge label-keyed series once per response so chart line and total
    // see identical data — both reflect sum-across-labels semantics.
    const mergedByConfig = data.map((response) =>
        sumSeriesByTimestamp(response.series),
    );

    const stepSeries: MultimetricStepSeries[] = data.map((_, i) => ({
        label: configs[i].title || configs[i].displayName,
        data: mergedByConfig[i],
    }));

    const stepTotals: MultimetricStep[] = data.map((_, i) => ({
        id: configs[i].id,
        label: configs[i].title || configs[i].displayName,
        value: aggregateTotal(mergedByConfig[i], configs[i].aggregationMode),
        previousStepPercentage: null,
    }));

    return {
        stepSeries,
        stepTotals,
        start: data[0].start,
        end: data[0].end,
        loading: isLoading,
    };
};
