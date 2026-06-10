import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import type {
    MultimetricStepSeries,
    MultimetricFeatureEvent,
} from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import {
    computeGoalSummary,
    type GoalSummary,
} from '../views/computeGoalSummary';
import type { ResolvedFeature } from '../views/FollowedFeaturesList/FollowedFeaturesList';
import { useResolvedFeatures } from './useResolvedFeatures';
import { useFollowedFeatureEvents } from './useFollowedFeatureEvents';
import type { MetricView } from '../views/types';

export type GoalViewData = {
    goalSummary: GoalSummary | undefined;
    goalSeries: MultimetricStepSeries | undefined;
    goalLabel: string;
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    start: string;
    end: string;
    featureEvents: MultimetricFeatureEvent[];
    resolvedFeatures: ResolvedFeature[];
    loading: boolean;
};

export const useGoalViewData = (view: MetricView): GoalViewData => {
    const { stepSeries, stepTotals, start, end, loading } =
        useGroupedImpactMetricsData(view.metrics);

    const { features: resolvedFeatures, loading: featuresLoading } =
        useResolvedFeatures(view.featureNames);

    const { featureEvents, loading: eventsLoading } = useFollowedFeatureEvents(
        view.featureNames,
        view.environment,
    );

    // `useGroupedImpactMetricsData` returns series/totals positionally aligned
    // with `view.metrics`, so the goal's series is at the goal metric's index —
    // not necessarily index 0.
    const goalIndex = view.metrics.findIndex((metric) => metric.goal);
    const goalMetric = goalIndex >= 0 ? view.metrics[goalIndex] : undefined;
    const goalSeries = goalIndex >= 0 ? stepSeries[goalIndex] : undefined;
    const goalSummary = goalMetric
        ? computeGoalSummary(
              goalSeries,
              goalMetric.aggregationMode,
              stepTotals[goalIndex]?.value ?? 0,
          )
        : undefined;

    return {
        goalSummary,
        goalSeries,
        goalLabel: goalMetric?.title || goalMetric?.displayName || view.title,
        stepSeries,
        stepTotals,
        start,
        end,
        featureEvents,
        resolvedFeatures,
        loading: loading || featuresLoading || eventsLoading,
    };
};
