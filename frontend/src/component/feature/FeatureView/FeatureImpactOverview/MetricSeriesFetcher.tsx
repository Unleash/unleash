import { type FC, useEffect, useRef } from 'react';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';

export type SeriesPayload = {
    label: string;
    data: [number, number][];
    total: number;
    start: string;
    end: string;
    loading: boolean;
};

interface MetricSeriesFetcherProps {
    config: ImpactMetricsConfigSchema;
    onSeriesLoaded: (id: string, payload: SeriesPayload) => void;
}

const payloadsEqual = (a: SeriesPayload, b: SeriesPayload): boolean => {
    if (
        a.label !== b.label ||
        a.total !== b.total ||
        a.start !== b.start ||
        a.end !== b.end ||
        a.loading !== b.loading ||
        a.data.length !== b.data.length
    ) {
        return false;
    }
    for (let i = 0; i < a.data.length; i += 1) {
        if (a.data[i][0] !== b.data[i][0] || a.data[i][1] !== b.data[i][1]) {
            return false;
        }
    }
    return true;
};

export const MetricSeriesFetcher: FC<MetricSeriesFetcherProps> = ({
    config,
    onSeriesLoaded,
}) => {
    const lastReportedRef = useRef<SeriesPayload | null>(null);

    const { data, loading } = useImpactMetricsData({
        metricName: config.metricName,
        range: config.timeRange,
        aggregationMode: config.aggregationMode,
        labels:
            Object.keys(config.labelSelectors).length > 0
                ? config.labelSelectors
                : undefined,
        source: config.source,
        mode: 'display',
    });

    useEffect(() => {
        const firstSeriesData = data.series?.[0]?.data ?? [];
        const numericData: [number, number][] = firstSeriesData.map(
            ([ts, value]) => [ts, Number(value)],
        );

        const total = (() => {
            if (numericData.length === 0) return 0;
            const lastValue = numericData[numericData.length - 1][1];
            const shouldSum =
                config.aggregationMode === 'count' ||
                config.aggregationMode === 'sum';
            return shouldSum
                ? numericData.reduce((sum, [, v]) => sum + v, 0)
                : lastValue;
        })();

        const payload: SeriesPayload = {
            label: config.title || config.displayName || config.metricName,
            data: numericData,
            total,
            start: data.start ?? '',
            end: data.end ?? '',
            loading,
        };

        if (
            lastReportedRef.current === null ||
            !payloadsEqual(lastReportedRef.current, payload)
        ) {
            lastReportedRef.current = payload;
            onSeriesLoaded(config.id, payload);
        }
    }, [
        config.id,
        config.title,
        config.displayName,
        config.metricName,
        config.aggregationMode,
        data.series,
        data.start,
        data.end,
        loading,
        onSeriesLoaded,
    ]);

    return null;
};
