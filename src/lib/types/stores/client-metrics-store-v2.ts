import { Store } from './store';

export interface IClientMetricsEnvKey {
    featureName: string;
    appName: string;
    environment: string;
}

export interface IClientMetricsEnv extends IClientMetricsEnvKey {
    timestamp: Date;
    yes: number;
    no: number;
}

export interface IClientMetricsStoreV2
    extends Store<IClientMetricsEnv, IClientMetricsEnvKey> {
    batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void>;
    getMetricsForFeatureToggle(
        featureName: string,
        hoursBack?: number,
    ): Promise<IClientMetricsEnv[]>;
}
