import type { AggregationMode, MetricSource } from '../types';

export type MultimetricStepInput = {
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
    featureEventEnvironments: string[];
};
