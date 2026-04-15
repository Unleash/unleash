import type { AggregationMode, MetricSource } from '../types';

export type MultimetricStepInput = {
    /** Stable identity for React keys; assigned at row-creation time. */
    id: string;
    metricName: string;
    label: string;
    aggregationMode: AggregationMode;
    source?: MetricSource;
};

export type MultimetricChartFormConfig = {
    title: string;
    timeRange: 'hour' | 'day' | 'week' | 'month';
    steps: MultimetricStepInput[];
    /** Environments whose feature enable/disable events should be overlaid. */
    featureEventEnvironments: string[];
};
