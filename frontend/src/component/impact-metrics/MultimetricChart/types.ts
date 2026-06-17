// Shared types for the multimetric chart card and its children.
// No runtime code — just type definitions so presentational components
// can live without any data-fetching dependencies.

export type MultimetricStepSeries = {
    label: string;
    data: [number, number][];
};

export type MultimetricFeatureEvent = {
    id: number;
    timestamp: number; // ms since epoch
    type: 'feature-environment-enabled' | 'feature-environment-disabled';
    label: string;
    createdBy: string;
    featureName: string;
    environment: string;
};

// A user-selected time window on the chart (the brush selection). Bounds are
// ms since epoch, matching the chart's millisecond x-axis.
export type TimeWindow = {
    fromMs: number;
    toMs: number;
};
