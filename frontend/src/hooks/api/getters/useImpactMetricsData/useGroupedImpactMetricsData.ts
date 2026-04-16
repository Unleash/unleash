import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { ImpactMetricsConfigSchema } from 'openapi';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import {
    buildImpactMetricsPath,
    type ImpactMetricsResponse,
} from './useImpactMetricsData';

const SUM_MODES = new Set(['count', 'sum']);

function aggregateTotal(
    series: ImpactMetricsResponse['series'],
    aggregationMode: string,
): number {
    if (!series.length || !series[0].data.length) return 0;
    const data = series[0].data;
    if (SUM_MODES.has(aggregationMode)) {
        return data.reduce((sum, [, v]) => sum + Number(v), 0);
    }
    // For rate/average/percentile modes, compute the mean across all data
    // points so the total reflects the overall chart shape rather than a
    // single (potentially noisy) last sample.
    const sum = data.reduce((acc, [, v]) => acc + Number(v), 0);
    return sum / data.length;
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
    const paths = configs.map((config) =>
        buildImpactMetricsPath({
            metricName: config.metricName,
            range: config.timeRange,
            aggregationMode: config.aggregationMode,
            labels:
                Object.keys(config.labelSelectors).length > 0
                    ? config.labelSelectors
                    : undefined,
            source: config.source,
            mode: 'display',
        }),
    );

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

    const stepSeries: MultimetricStepSeries[] = data.map((response, i) => ({
        label: configs[i].title || configs[i].displayName,
        data: (response.series[0]?.data ?? []).map(([ts, val]) => [
            ts,
            Number(val),
        ]),
    }));

    const stepTotals: MultimetricStep[] = data.map((response, i) => ({
        label: configs[i].title || configs[i].displayName,
        value: aggregateTotal(response.series, configs[i].aggregationMode),
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
