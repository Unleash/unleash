import type { ImpactMetricsConfigSchema } from 'openapi';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';

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
    showTopMovers?: boolean;
    createdAt: number;
    updatedAt: number;
};
