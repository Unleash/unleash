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
    | 'timeRange'
>;

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

export const DEFAULT_VIEW_ENVIRONMENT = 'production';
export const DEFAULT_VIEW_TIME_RANGE: ChartTimeRange = 'week';
export const VIEW_LIST_STORAGE_KEY = 'impact-metric-views:list';
export const ACTIVE_VIEW_STORAGE_KEY = 'impact-metric-views:active-id';
