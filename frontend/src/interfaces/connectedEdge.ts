export type ConnectedEdge = {
    id?: string;
    appName: string;
    connectedStreamingClients: number;
    edgeVersion: string;
    instanceId: string;
    region: string | null;
    hosting?: 'hosted' | 'enterprise-self-hosted';
    reportedAt: string;
    started: string;
    connectedVia?: string;
    cpuUsage: string;
    memoryUsage: number;
    clientFeaturesAverageLatencyMs: string;
    clientFeaturesP99LatencyMs: string;
    frontendApiAverageLatencyMs: string;
    frontendApiP99LatencyMs: string;
    upstreamFeaturesAverageLatencyMs: string;
    upstreamFeaturesP99LatencyMs: string;
    upstreamMetricsAverageLatencyMs: string;
    upstreamMetricsP99LatencyMs: string;
    upstreamEdgeAverageLatencyMs: string;
    upstreamEdgeP99LatencyMs: string;
    apiKeyRevisionIds?: EdgeApiKeyRevisionId[];
};

export type EdgeApiKeyRevisionId = {
    environment: string;
    projects: string[];
    revisionId: number;
    lastUpdated: Date;
};
