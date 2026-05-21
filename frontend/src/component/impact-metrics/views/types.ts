import type { ImpactMetricsConfigSchema } from 'openapi';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';

export type ViewTemplate = 'goal-tracking' | 'system-health';

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
    template: ViewTemplate;
    featureNames: string[];
    metrics: ViewMetricConfig[];
    timeRange: ChartTimeRange;
    environment: string;
    normalize?: boolean;
    autoFollowFlags?: boolean;
    createdAt: number;
    updatedAt: number;
};

export const DEFAULT_VIEW_ENVIRONMENT = 'production';
export const DEFAULT_VIEW_TIME_RANGE: ChartTimeRange = 'week';
export const DEFAULT_VIEW_TEMPLATE: ViewTemplate = 'goal-tracking';
export const VIEW_LIST_STORAGE_KEY = 'impact-metric-views:list';
export const ACTIVE_VIEW_STORAGE_KEY = 'impact-metric-views:active-id';

export const TEMPLATE_DEFAULTS: Record<
    ViewTemplate,
    {
        timeRange: ChartTimeRange;
        normalize: boolean;
        autoFollowFlags: boolean;
    }
> = {
    'goal-tracking': {
        timeRange: 'month',
        // Default off — normalization rebases each series to start at 100 so
        // they share an axis, but it makes the Y-axis ticks (which still read
        // like raw values) misleading next to the raw totals in the right
        // rail. Users who want the rebased view can opt in via the editor.
        normalize: false,
        autoFollowFlags: false,
    },
    'system-health': {
        timeRange: 'hour',
        normalize: false,
        autoFollowFlags: true,
    },
};
