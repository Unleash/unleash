import { useMemo, type FC } from 'react';
import { styled, Typography } from '@mui/material';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { MultimetricChartCard } from 'component/impact-metrics/MultimetricChart/MultimetricChartCard';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { useMergedFeatureEvents } from './useMergedFeatureEvents';
import type { MetricView } from './types';

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

export type ViewChartProps = {
    view: MetricView;
    project?: string;
};

const ALL_PROJECTS_FILTER = '*';

export const ViewChart: FC<ViewChartProps> = ({ view, project }) => {
    const projectFilter = project ?? ALL_PROJECTS_FILTER;

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

    const {
        featureEvents,
        loading: eventsLoading,
        loaders,
    } = useMergedFeatureEvents(
        view.featureNames,
        projectFilter,
        view.environment,
    );

    const firstMetric = view.metrics[0];
    const extraCount = view.metrics.length - 1;
    const title =
        view.metrics.length === 0
            ? view.title
            : extraCount > 0
              ? `${firstMetric.title || firstMetric.displayName} +${extraCount} more`
              : firstMetric.title || firstMetric.displayName;

    const followedSummary =
        view.featureNames.length === 0
            ? 'No followed features'
            : `Following ${view.featureNames.length} feature${view.featureNames.length === 1 ? '' : 's'} · ${view.environment}`;

    return (
        <StyledRoot>
            {loaders}
            <StyledSubtitle>{followedSummary}</StyledSubtitle>
            <MultimetricChartCard
                title={title}
                timeRange={view.timeRange}
                aggregationMode={firstMetric?.aggregationMode}
                stepCount={view.metrics.length}
                stepSeries={stepSeries}
                stepTotals={stepTotals}
                start={start}
                end={end}
                featureEvents={featureEvents}
                loading={metricsLoading || eventsLoading}
            />
        </StyledRoot>
    );
};
