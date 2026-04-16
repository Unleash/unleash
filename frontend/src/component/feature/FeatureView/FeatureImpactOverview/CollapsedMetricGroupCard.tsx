import { type FC, useCallback, useMemo, useState } from 'react';
import type { ImpactMetricsConfigSchema } from 'openapi';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import { MultimetricChartCard } from './MultimetricChartCard';
import {
    MetricSeriesFetcher,
    type SeriesPayload,
} from './MetricSeriesFetcher';

interface CollapsedMetricGroupCardProps {
    configs: ImpactMetricsConfigSchema[];
    projectId: string;
    featureName: string;
}

export const CollapsedMetricGroupCard: FC<CollapsedMetricGroupCardProps> = ({
    configs,
    projectId,
    featureName,
}) => {
    const [state, setState] = useState<Record<string, SeriesPayload>>({});

    const handleLoaded = useCallback(
        (id: string, payload: SeriesPayload) => {
            setState((prev) => ({ ...prev, [id]: payload }));
        },
        [],
    );

    const { stepSeries, stepTotals, loading, start, end } = useMemo(() => {
        const orderedPayloads = configs.map((c) => state[c.id]);

        const labelFor = (
            c: ImpactMetricsConfigSchema,
            payload: SeriesPayload | undefined,
        ): string =>
            payload?.label || c.title || c.displayName || c.metricName;

        const stepSeries: MultimetricStepSeries[] = configs.map(
            (c, index) => ({
                label: labelFor(c, orderedPayloads[index]),
                data: orderedPayloads[index]?.data ?? [],
            }),
        );

        const stepTotals: MultimetricStep[] = configs.map((c, index) => ({
            label: labelFor(c, orderedPayloads[index]),
            value: orderedPayloads[index]?.total ?? 0,
            previousStepPercentage: null,
        }));

        const loading = orderedPayloads.some(
            (p) => p === undefined || p.loading,
        );

        const firstLoaded = orderedPayloads.find(
            (p) => p && p.start !== '' && p.end !== '',
        );

        return {
            stepSeries,
            stepTotals,
            loading,
            start: firstLoaded?.start ?? '',
            end: firstLoaded?.end ?? '',
        };
    }, [configs, state]);

    const title = useMemo(() => {
        const firstLabel =
            configs[0].title ||
            configs[0].displayName ||
            configs[0].metricName;
        const extra = configs.length - 1;
        return extra > 0 ? `${firstLabel} +${extra} more` : firstLabel;
    }, [configs]);

    const timeRange = configs[0].timeRange as ChartTimeRange;

    return (
        <>
            {configs.map((config) => (
                <MetricSeriesFetcher
                    key={config.id}
                    config={config}
                    onSeriesLoaded={handleLoaded}
                />
            ))}
            <MultimetricChartCard
                title={title}
                timeRange={timeRange}
                stepCount={configs.length}
                stepSeries={stepSeries}
                stepTotals={stepTotals}
                featureEvents={[]}
                start={start}
                end={end}
                loading={loading}
                href={`/projects/${projectId}/features/${featureName}/metrics`}
            />
        </>
    );
};
