import type { ImpactMetricsConfigSchema } from 'openapi';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

export type ImpactViewFeatureEvent = MultimetricFeatureEvent & {
    featureName?: string;
};

export type ViewMetricConfig = Pick<
    ImpactMetricsConfigSchema,
    | 'id'
    | 'metricName'
    | 'displayName'
    | 'aggregationMode'
    | 'labelSelectors'
    | 'source'
    | 'title'
    | 'yAxisMin'
    | 'timeRange'
> & {
    goal?: boolean;
};

export type MetricView = {
    id: string;
    title: string;
    featureNames: string[];
    metrics: ViewMetricConfig[];
    timeRange: ChartTimeRange;
    environment: string;
    createdAt: number;
    updatedAt: number;
};
