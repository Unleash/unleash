export type ChartConfig = {
    id: string;
    selectedSeries: string; // e.g. unleash_counter_my_metric
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    beginAtZero: boolean;
    aggregationMode: AggregationMode;
    selectedLabels: Record<string, string[]>;
    title?: string;
};

export type AggregationMode = 'rps' | 'count' | 'avg' | 'sum';

export type DisplayChartConfig = ChartConfig & {
    type: 'counter' | 'gauge';
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
