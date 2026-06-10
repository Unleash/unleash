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
> & {
    // Wider than the stored-config schema type: views support the extended
    // query-only ranges (threeMonths/sixMonths).
    timeRange: ChartTimeRange;
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
