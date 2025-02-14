export type ConnectedEdge = {
    appName: string;
    connectedStreamingClients: number;
    edgeVersion: string;
    instanceId: string;
    region: string | null;
    reportedAt: string;
    started: string;
    connectedVia?: string;
    cpuUsage: number;
    memoryUsage: number;
};
