/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EventEmitter from 'events';
import type {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsStoreV2,
} from './client-metrics-store-v2-type.js';

export default class FakeClientMetricsStoreV2
    extends EventEmitter
    implements IClientMetricsStoreV2
{
    metrics: IClientMetricsEnv[] = [];

    constructor() {
        super();
        this.setMaxListeners(0);
    }

    getFeatureFlagNames(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getSeenTogglesForApp(
        _appName: string,
        _hoursBack?: number,
    ): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    clearMetrics(_hoursBack: number): Promise<void> {
        return Promise.resolve();
    }
    clearDailyMetrics(_daysBack: number): Promise<void> {
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
        _featureName: string,
        _hoursBack?: number,
    ): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggle(
        _featureName: string,
        _hoursBack?: number,
    ): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggleV2(
        _featureName: string,
        _hoursBack?: number,
    ): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        metrics.forEach((m) => {
            this.metrics.push(m);
        });
        return Promise.resolve();
    }
    get(_key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        throw new Error('Method not implemented.');
    }
    getAll(_query?: Object): Promise<IClientMetricsEnv[]> {
        throw new Error('Method not implemented.');
    }
    exists(_key: IClientMetricsEnvKey): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(_key: IClientMetricsEnvKey): Promise<void> {
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
