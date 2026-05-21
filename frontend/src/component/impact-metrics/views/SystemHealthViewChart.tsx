import { useMemo, type FC } from 'react';
import { styled } from '@mui/material';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { MultimetricChartCard } from 'component/impact-metrics/MultimetricChart/MultimetricChartCard';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { useMergedFeatureEvents } from './useMergedFeatureEvents';
import { useAutoFollowedFeatureNames } from './useAutoFollowedFeatureNames';
import { FollowedFeaturesList } from './FollowedFeaturesList';
import type { MetricView } from './types';

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledPanels = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const TIME_RANGE_LABELS: Record<MetricView['timeRange'], string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

const AGGREGATION_LABELS: Record<string, string> = {
    count: 'Count',
    rps: 'Rate per second',
    sum: 'Sum',
    avg: 'Average',
    p50: '50th percentile',
    p95: '95th percentile',
    p99: '99th percentile',
};

export type SystemHealthViewChartProps = {
    view: MetricView;
    project: string;
};

export const SystemHealthViewChart: FC<SystemHealthViewChartProps> = ({
    view,
    project,
}) => {
    const configs = useMemo<ImpactMetricsConfigSchema[]>(
        () =>
            view.metrics.map((metric) => ({
                id: metric.id,
                metricName: metric.metricName,
                displayName: metric.displayName,
                aggregationMode: metric.aggregationMode,
                labelSelectors: metric.labelSelectors,
                source: metric.source,
                title: metric.title,
                yAxisMin: metric.yAxisMin,
                timeRange: view.timeRange,
            })),
        [view.metrics, view.timeRange],
    );

    const {
        stepSeries,
        stepTotals,
        start,
        end,
        loading: metricsLoading,
    } = useGroupedImpactMetricsData(configs);

    const { featureNames, loading: autoFollowLoading } =
        useAutoFollowedFeatureNames(view);

    const {
        featureEvents,
        loading: eventsLoading,
        loaders,
    } = useMergedFeatureEvents(featureNames, project, view.environment);

    const loading = metricsLoading || autoFollowLoading || eventsLoading;
    const timeLabel = TIME_RANGE_LABELS[view.timeRange];

    return (
        <StyledRoot>
            {loaders}
            <StyledPanels>
                {view.metrics.map((metric, index) => {
                    const series = stepSeries[index];
                    const total = stepTotals[index];
                    const aggregationLabel =
                        AGGREGATION_LABELS[metric.aggregationMode] ??
                        metric.aggregationMode;
                    return (
                        <MultimetricChartCard
                            key={metric.id}
                            title={metric.title || metric.displayName}
                            subtitle={`${aggregationLabel} \u00B7 ${timeLabel}`}
                            timeRange={view.timeRange}
                            aggregationMode={metric.aggregationMode}
                            stepCount={1}
                            stepSeries={series ? [series] : []}
                            stepTotals={total ? [total] : []}
                            start={start}
                            end={end}
                            featureEvents={featureEvents}
                            loading={loading}
                            chartHeightSpacing={{ base: 32, lg: 28, sm: 24 }}
                        />
                    );
                })}
            </StyledPanels>
            <FollowedFeaturesList featureNames={featureNames} />
        </StyledRoot>
    );
};
