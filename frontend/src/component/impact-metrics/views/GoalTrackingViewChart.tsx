import { useMemo, type FC } from 'react';
import { styled } from '@mui/material';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { MultimetricChartCard } from 'component/impact-metrics/MultimetricChart/MultimetricChartCard';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { useMergedFeatureEvents } from './useMergedFeatureEvents';
import { FollowedFeaturesList } from './FollowedFeaturesList';
import { normalizeSeriesToBaseline } from './normalizeSeriesToBaseline';
import { computeGoalSummary } from './computeGoalSummary';
import { GoalSummaryPanel } from './GoalSummaryPanel';
import type { MetricView, ViewMetricConfig } from './types';

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const TIME_RANGE_LABELS: Record<MetricView['timeRange'], string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

export type GoalTrackingViewChartProps = {
    view: MetricView;
    project: string;
};

// Goal metric leads so the chart legend, totals, and color sequence all
// emphasize it.
const sortMetricsByGoalFirst = (
    metrics: ViewMetricConfig[],
): ViewMetricConfig[] => {
    const goal = metrics.find((metric) => metric.goal);
    if (!goal) return metrics;
    return [goal, ...metrics.filter((metric) => metric !== goal)];
};

export const GoalTrackingViewChart: FC<GoalTrackingViewChartProps> = ({
    view,
    project,
}) => {
    const orderedMetrics = useMemo(
        () => sortMetricsByGoalFirst(view.metrics),
        [view.metrics],
    );

    const configs = useMemo<ImpactMetricsConfigSchema[]>(
        () =>
            orderedMetrics.map((metric) => ({
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
        [orderedMetrics, view.timeRange],
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
    } = useMergedFeatureEvents(view.featureNames, project, view.environment);

    const renderedSeries = useMemo(
        () =>
            view.normalize ? normalizeSeriesToBaseline(stepSeries) : stepSeries,
        [view.normalize, stepSeries],
    );

    const goalMetric = orderedMetrics.find((metric) => metric.goal);
    const signalCount = orderedMetrics.length - (goalMetric ? 1 : 0);
    const timeLabel = TIME_RANGE_LABELS[view.timeRange];

    const goalSeries = goalMetric ? stepSeries[0] : undefined;
    const goalTotal = goalMetric ? (stepTotals[0]?.value ?? 0) : 0;
    const goalSummary = useMemo(
        () =>
            goalMetric
                ? computeGoalSummary(
                      goalSeries,
                      goalMetric.aggregationMode,
                      goalTotal,
                  )
                : null,
        [goalMetric, goalSeries, goalTotal],
    );

    const title = goalMetric
        ? goalMetric.title || goalMetric.displayName
        : view.metrics.length === 0
          ? view.title
          : orderedMetrics[0].title || orderedMetrics[0].displayName;

    const subtitle = goalMetric
        ? `Goal: ${goalMetric.displayName} \u00B7 ${signalCount} signal${
              signalCount === 1 ? '' : 's'
          } \u00B7 ${timeLabel}`
        : `${orderedMetrics.length} metrics \u00B7 ${timeLabel}`;

    const totalsHeaderSlot =
        goalMetric && goalSummary ? (
            <GoalSummaryPanel
                goalMetricLabel={goalMetric.title || goalMetric.displayName}
                summary={goalSummary}
                series={goalSeries}
                timeLabel={timeLabel}
            />
        ) : null;

    return (
        <StyledRoot>
            {loaders}
            <MultimetricChartCard
                title={title}
                subtitle={subtitle}
                timeRange={view.timeRange}
                aggregationMode={orderedMetrics[0]?.aggregationMode}
                stepCount={orderedMetrics.length}
                stepSeries={renderedSeries}
                stepTotals={stepTotals}
                start={start}
                end={end}
                featureEvents={featureEvents}
                loading={metricsLoading || eventsLoading}
                chartHeightSpacing={{ base: 48, lg: 40, sm: 32 }}
                totalsHeaderSlot={totalsHeaderSlot}
                totalsLabel={goalMetric ? 'Signals' : undefined}
            />
            <FollowedFeaturesList featureNames={view.featureNames} />
        </StyledRoot>
    );
};
