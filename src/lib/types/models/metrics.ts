export interface GroupedClientMetrics {
    environment: string;
    timestamp: Date;
    yes: number;
    no: number;
}

export interface ToggleMetricsSummary {
    featureName: string;
    lastHourUsage: GroupedClientMetrics[];
    seenApplications: string[];
}
