import EventEmitter from 'events';
import { Logger, LogProvider } from '../logger';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { ClientMetricsDb } from './client-metrics-db';
import { IClientMetric } from '../types/stores/client-metrics-db';
import { IClientMetricsStore } from '../types/stores/client-metrics-store';

const TEN_SECONDS = 10 * 1000;

export class ClientMetricsStore
    extends EventEmitter
    implements IClientMetricsStore
{
    private logger: Logger;

    highestIdSeen = 0;

    private startTimer: Function;

    private timer: NodeJS.Timeout;

    constructor(
        private metricsDb: ClientMetricsDb,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        pollInterval = TEN_SECONDS,
    ) {
        super();
        this.logger = getLogger('client-metrics-store.ts.js');
        this.metricsDb = metricsDb;
        this.highestIdSeen = 0;

        this.startTimer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'metrics',
                action,
            });

        process.nextTick(async () => {
            await this._init(pollInterval);
        });
    }

    async _init(pollInterval: number): Promise<void> {
        try {
            const metrics = await this.metricsDb.getMetricsLastHour();
            this._emitMetrics(metrics);
        } catch (err) {
            this.logger.error('Error fetching metrics last hour', err);
        }
        this._startPoller(pollInterval);
        this.emit('ready');
    }

    _startPoller(pollInterval: number): void {
        this.timer = setInterval(() => this._fetchNewAndEmit(), pollInterval);
        this.timer.unref();
    }

    _fetchNewAndEmit(): void {
        this.metricsDb
            .getNewMetrics(this.highestIdSeen)
            .then((metrics) => this._emitMetrics(metrics));
    }

    _emitMetrics(metrics: IClientMetric[]): void {
        if (metrics && metrics.length > 0) {
            this.highestIdSeen = metrics[metrics.length - 1].id;
            metrics.forEach((m) => this.emit('metrics', m.metrics));
        }
    }

    // Insert new client metrics
    async insert(metrics: IClientMetric): Promise<void> {
        const stopTimer = this.startTimer('insert');

        await this.metricsDb.insert(metrics);

        stopTimer();
    }

    destroy(): void {
        clearInterval(this.timer);
        this.metricsDb.destroy();
    }

    async delete(key: number): Promise<void> {
        await this.metricsDb.delete(key);
    }

    async deleteAll(): Promise<void> {
        await this.metricsDb.deleteAll();
    }

    async exists(key: number): Promise<boolean> {
        return this.metricsDb.exists(key);
    }

    async get(key: number): Promise<IClientMetric> {
        return this.metricsDb.get(key);
    }

    async getAll(): Promise<IClientMetric[]> {
        return this.metricsDb.getMetricsLastHour();
    }
}
