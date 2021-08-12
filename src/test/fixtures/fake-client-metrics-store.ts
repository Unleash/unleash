import EventEmitter from 'events';
import { IClientMetricsStore } from '../../lib/types/stores/client-metrics-store';
import { IClientMetric } from '../../lib/types/stores/client-metrics-db';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeClientMetricsStore
    extends EventEmitter
    implements IClientMetricsStore
{
    metrics: IClientMetric[] = [];

    constructor() {
        super();
        this.setMaxListeners(0);
    }

    async getMetricsLastHour(): Promise<IClientMetric[]> {
        return Promise.resolve([]);
    }

    async insert(): Promise<void> {
        return Promise.resolve();
    }

    async delete(key: number): Promise<void> {
        this.metrics.splice(
            this.metrics.findIndex((m) => m.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.metrics.some((m) => m.id === key);
    }

    async get(key: number): Promise<IClientMetric> {
        const metric = this.metrics.find((m) => m.id === key);
        if (metric) {
            return metric;
        }
        throw new NotFoundError(`Could not find metric with key: ${key}`);
    }

    async getAll(): Promise<IClientMetric[]> {
        return this.metrics;
    }
}
