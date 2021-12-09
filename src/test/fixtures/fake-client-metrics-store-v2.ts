/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EventEmitter from 'events';
import {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsStoreV2,
} from '../../lib/types/stores/client-metrics-store-v2';

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
