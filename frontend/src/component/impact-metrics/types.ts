export type ChartConfig = {
    id: string;
    selectedSeries: string;
    selectedRange: 'hour' | 'day' | 'week' | 'month';
    beginAtZero: boolean;
    selectedLabels: Record<string, string[]>;
    title?: string;
};

export type ImpactMetricsState = {
    charts: ChartConfig[];
};
