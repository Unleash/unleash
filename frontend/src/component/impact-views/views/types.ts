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
    // Flags are followed by name and may live in different projects; the view
    // is intentionally project-agnostic. Each flag's project is resolved from
    // the flag itself, not declared here.
    featureNames: string[];
    metrics: ViewMetricConfig[];
    timeRange: ChartTimeRange;
    environment: string;
    createdAt: number;
    updatedAt: number;
};
