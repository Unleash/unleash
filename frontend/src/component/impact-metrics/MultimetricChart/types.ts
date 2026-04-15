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
};
