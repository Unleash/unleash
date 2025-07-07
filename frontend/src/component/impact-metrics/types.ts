export type ChartConfig = {
    id: string;
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    beginAtZero: boolean;
    selectedLabels: Record<string, string[]>;
    title?: string;
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
