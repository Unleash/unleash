import type { ImpactMetricsConfigSchema } from 'openapi';
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
    const goalMetric = view.metrics.find((metric) => metric.goal);
    const configs = view.metrics as ImpactMetricsConfigSchema[];

    const { stepSeries, stepTotals, start, end, loading } =
        useGroupedImpactMetricsData(configs);

    const { features: resolvedFeatures, loading: featuresLoading } =
        useResolvedFeatures(view.featureNames);

    const { featureEvents, loading: eventsLoading } = useFollowedFeatureEvents(
        view.featureNames,
        view.environment,
    );

    const goalSeries = stepSeries[0];
    const goalSummary = goalMetric
        ? computeGoalSummary(
              goalSeries,
              goalMetric.aggregationMode,
              stepTotals[0]?.value ?? 0,
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
