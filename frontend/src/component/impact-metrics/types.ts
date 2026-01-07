export type ChartConfig = {
    id: string;
    metricName: string; // e.g. unleash_counter_my_metric
    timeRange: 'hour' | 'day' | 'week' | 'month';
    yAxisMin: 'auto' | 'zero';
    aggregationMode: AggregationMode;
    labelSelectors: Record<string, string[]>;
    title?: string;
};

export type AggregationMode =
    | 'rps'
    | 'count'
    | 'avg'
    | 'sum'
    | 'p50'
    | 'p95'
    | 'p99';

export type DisplayChartConfig = ChartConfig & {
    type: 'counter' | 'gauge' | 'histogram' | 'unknown';
    displayName: string; // e.g. my_metric with unleash_counter stripped
    mode?: 'read' | 'write';
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
