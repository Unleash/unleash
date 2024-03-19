/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EventEmitter from 'events';
import type {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsStoreV2,
} from './client-metrics-store-v2-type';

export default class FakeClientMetricsStoreV2
    extends EventEmitter
    implements IClientMetricsStoreV2
{
    metrics: IClientMetricsEnv[] = [];

    constructor() {
        super();
        this.setMaxListeners(0);
    }
    getSeenTogglesForApp(
        appName: string,
        hoursBack?: number,
    ): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    clearMetrics(hoursBack: number): Promise<void> {
        return Promise.resolve();
    }
    clearDailyMetrics(daysBack: number): Promise<void> {
        return Promise.resolve();
    }
    countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }> {
        return Promise.resolve({ enabledCount: 0, variantCount: 0 });
    }
    countPreviousDayMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }> {
        return Promise.resolve({ enabledCount: 0, variantCount: 0 });
    }
    aggregateDailyMetrics(): Promise<void> {
        return Promise.resolve();
    }
    getSeenAppsForFeatureToggle(
        featureName: string,
        hoursBack?: number,
    ): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggle(
        featureName: string,
        hoursBack?: number,
    ): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggleV2(
        featureName: string,
        hoursBack?: number,
    ): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        metrics.forEach((m) => this.metrics.push(m));
        return Promise.resolve();
    }
    get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        throw new Error('Method not implemented.');
    }
    getAll(query?: Object): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    exists(key: IClientMetricsEnvKey): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(key: IClientMetricsEnvKey): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getMetricsLastHour(): Promise<[]> {
        return Promise.resolve([]);
    }

    async insert(): Promise<void> {
        return Promise.resolve();
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}
}
