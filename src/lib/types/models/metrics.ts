export interface GroupedClientMetrics {
    environment: string;
    timestamp: Date;
    yes: number;
    no: number;
}

export interface EnvironmentTotalUsage {
    environment: string;
    yes: number;
    no: number;
}

export interface ToggleMetricsSummary {
    featureName: string;
    lastHourUsage: GroupedClientMetrics[];
    totalUsage?: EnvironmentTotalUsage[];
    seenApplications: string[];
}
