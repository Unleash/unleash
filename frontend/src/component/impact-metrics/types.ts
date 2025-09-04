export type ChartConfig = {
    id: string;
    metricName: string; // e.g. unleash_counter_my_metric
    timeRange: 'hour' | 'day' | 'week' | 'month';
    yAxisMin: 'auto' | 'zero';
    aggregationMode: AggregationMode;
    labelSelectors: Record<string, string[]>;
    title?: string;
};

export type AggregationMode = 'rps' | 'count' | 'avg' | 'sum';

export type DisplayChartConfig = ChartConfig & {
    type: 'counter' | 'gauge' | 'unknown';
    displayName: string; // e.g. my_metric with unleash_counter stripped
};

export type LayoutItem = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
};

export type ImpactMetricsState = {
    charts: ChartConfig[];
    layout: LayoutItem[];
};

export type DisplayImpactMetricsState = {
    charts: DisplayChartConfig[];
    layout: LayoutItem[];
};
