import { useCallback, useMemo, useState, type FC } from 'react';
import { Box, FormControlLabel, Switch, styled } from '@mui/material';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { MultimetricChartCard } from 'component/impact-metrics/MultimetricChart/MultimetricChartCard';
import { parseVisibleWindow } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { ImpactMetricsConfigSchema } from 'openapi';
import { useMergedFeatureEvents } from './useMergedFeatureEvents';
import { FollowedFeaturesList } from './FollowedFeaturesList';
import { computeGoalSummary } from './computeGoalSummary';
import {
    BASELINE_OPTIONS,
    DEFAULT_BASELINE_BY_TIME_RANGE,
    computeFlagEventImpacts,
    type BaselineOptionId,
} from './computeFlagEventImpact';
import { GoalSummaryPanel } from './GoalSummaryPanel';
import { TopFlagMoversPanel } from './TopFlagMoversPanel';
import { FlagImpactDialog } from './FlagImpactDialog';
import { simulateFlagContributionScenario } from './simulateFlagContribution';
import type { MetricView, ViewMetricConfig } from './types';

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledSimulationStrip = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 1.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px dashed ${theme.palette.warning.main}`,
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    alignSelf: 'flex-start',
    fontSize: theme.fontSizes.smallerBody,
}));

const IS_DEV = import.meta.env.DEV;

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

    const [simulationEnabled, setSimulationEnabled] = useState(false);

    const {
        stepSeries: realStepSeries,
        stepTotals: realStepTotals,
        start: realStart,
        end: realEnd,
        loading: metricsLoading,
    } = useGroupedImpactMetricsData(configs);

    const {
        featureEvents: realFeatureEvents,
        loading: eventsLoading,
        loaders,
    } = useMergedFeatureEvents(view.featureNames, project, view.environment);

    const simulatedScenario = useMemo(
        () =>
            simulationEnabled
                ? simulateFlagContributionScenario(view.timeRange)
                : null,
        [simulationEnabled, view.timeRange],
    );

    const stepSeries = simulatedScenario?.stepSeries ?? realStepSeries;
    const stepTotals = simulatedScenario?.stepTotals ?? realStepTotals;
    const start = simulatedScenario?.start ?? realStart;
    const end = simulatedScenario?.end ?? realEnd;
    const featureEvents = simulatedScenario?.featureEvents ?? realFeatureEvents;

    // Normalization is no longer used — the rebased values were misleading
    // next to the raw totals in the right rail. Charts now show raw series
    // unconditionally. The `view.normalize` field is preserved on existing
    // persisted views but ignored at render time.
    const renderedSeries = stepSeries;

    const realGoalMetric = orderedMetrics.find((metric) => metric.goal);
    // While simulating, treat the synthesized first series as the goal even
    // when the underlying view config has no `goal: true` metric, so the
    // contribution panel still has something to attribute to.
    const simulatedGoalMetric: Pick<
        ViewMetricConfig,
        'displayName' | 'title' | 'aggregationMode'
    > | null = simulationEnabled
        ? {
              displayName: stepSeries[0]?.label ?? 'Simulated goal',
              title: 'Simulated goal',
              aggregationMode: 'sum',
          }
        : null;
    const goalMetric = realGoalMetric ?? simulatedGoalMetric;
    const signalCount = simulationEnabled
        ? Math.max(0, stepSeries.length - 1)
        : orderedMetrics.length - (realGoalMetric ? 1 : 0);
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

    const effectiveMetricsCount = simulationEnabled
        ? stepSeries.length
        : orderedMetrics.length;
    const subtitle = goalMetric
        ? `Goal: ${goalMetric.displayName} \u00B7 ${signalCount} signal${
              signalCount === 1 ? '' : 's'
          } \u00B7 ${timeLabel}`
        : `${effectiveMetricsCount} metrics \u00B7 ${timeLabel}`;

    const totalsHeaderSlot =
        goalMetric && goalSummary ? (
            <GoalSummaryPanel
                goalMetricLabel={goalMetric.title || goalMetric.displayName}
                summary={goalSummary}
                series={goalSeries}
                timeLabel={timeLabel}
            />
        ) : null;

    const isLoading = simulationEnabled
        ? false
        : metricsLoading || eventsLoading;

    const [highlightedEventId, setHighlightedEventId] = useState<number | null>(
        null,
    );
    const handleHighlightedEventChange = useCallback(
        (eventId: number | null) => setHighlightedEventId(eventId),
        [],
    );

    // Baseline (half-window) used for every Δ in the right-rail panel and the
    // pill tooltips. Re-seeded whenever the chart time range changes so the
    // default scales sensibly with the visible window.
    const [baselineId, setBaselineId] = useState<BaselineOptionId>(
        DEFAULT_BASELINE_BY_TIME_RANGE[view.timeRange],
    );
    const baselineHalfWindowMs = useMemo(() => {
        const option = BASELINE_OPTIONS.find((opt) => opt.id === baselineId);
        return option?.halfWindowMs;
    }, [baselineId]);

    // Use the *raw* goal series for impact math — `renderedSeries` may be
    // normalized (rescaled to a baseline of 100), which would make absolute Δs
    // meaningless.
    const flagEventImpacts = useMemo(() => {
        if (!goalMetric || !goalSeries) return [];
        const visibleWindow = parseVisibleWindow(start, end);
        if (!visibleWindow) return [];
        return computeFlagEventImpacts({
            events: featureEvents,
            goalSeries,
            aggregationMode: goalMetric.aggregationMode,
            visibleWindow,
            timeRange: view.timeRange,
            halfWindowMs: baselineHalfWindowMs,
        });
    }, [
        goalMetric,
        goalSeries,
        featureEvents,
        start,
        end,
        view.timeRange,
        baselineHalfWindowMs,
    ]);

    // Index impacts by event id so the pill tooltip can look them up without
    // re-running the computation per render.
    const eventImpactById = useMemo(() => {
        const indexed: Record<
            number,
            {
                deltaPct: number | null;
                deltaAbs: number | null;
                halfWindowMs: number;
            }
        > = {};
        for (const impact of flagEventImpacts) {
            indexed[impact.eventId] = {
                deltaPct: impact.deltaPct,
                deltaAbs: impact.deltaAbs,
                halfWindowMs: impact.halfWindowMs,
            };
        }
        return indexed;
    }, [flagEventImpacts]);

    // Independent from `highlightedEventId`: opening the detail dialog should
    // survive the mouse leaving the row.
    const [openedEventId, setOpenedEventId] = useState<number | null>(null);
    const openedImpact = useMemo(
        () =>
            openedEventId === null
                ? null
                : (flagEventImpacts.find(
                      (impact) => impact.eventId === openedEventId,
                  ) ?? null),
        [openedEventId, flagEventImpacts],
    );

    const topMoversPanel = goalMetric ? (
        <TopFlagMoversPanel
            impacts={flagEventImpacts}
            highlightedEventId={highlightedEventId}
            onHighlightedEventChange={handleHighlightedEventChange}
            baselineId={baselineId}
            onBaselineChange={setBaselineId}
            onOpenedEventChange={setOpenedEventId}
        />
    ) : null;

    return (
        <StyledRoot>
            {loaders}
            {IS_DEV ? (
                <StyledSimulationStrip>
                    <FormControlLabel
                        control={
                            <Switch
                                size='small'
                                checked={simulationEnabled}
                                onChange={(event) =>
                                    setSimulationEnabled(event.target.checked)
                                }
                            />
                        }
                        label='Simulate flag-contribution scenario (dev only)'
                        sx={{ margin: 0 }}
                    />
                </StyledSimulationStrip>
            ) : null}
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
                loading={isLoading}
                chartHeightSpacing={{ base: 48, lg: 40, sm: 32 }}
                totalsHeaderSlot={totalsHeaderSlot}
                totalsMiddleSlot={topMoversPanel}
                expandTotalsColumn={Boolean(topMoversPanel)}
                totalsLabel={goalMetric ? 'Signals' : undefined}
                highlightedEventId={highlightedEventId}
                eventImpactById={eventImpactById}
            />
            <FollowedFeaturesList featureNames={view.featureNames} />
            {goalMetric ? (
                <FlagImpactDialog
                    impact={openedImpact}
                    aggregationMode={goalMetric.aggregationMode}
                    onClose={() => setOpenedEventId(null)}
                />
            ) : null}
        </StyledRoot>
    );
};
