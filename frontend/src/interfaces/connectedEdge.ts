export type ConnectedEdge = {
    appName: string;
    connectedStreamingClients: number;
    edgeVersion: string;
    instanceId: string;
    region: string | null;
    reportedAt: string;
    start: string;
    connectedVia?: string;
};
