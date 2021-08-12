export interface IClientMetric {
    id: number;
    createdAt: Date;
    metrics: any;
}

export interface IClientMetricsDb {
    removeMetricsOlderThanOneHour(): Promise<void>;
    insert(metrics: IClientMetric);
    getMetricsLastHour(): Promise<IClientMetric[]>;
    getNewMetrics(lastKnownId: number): Promise<IClientMetric[]>;
}
