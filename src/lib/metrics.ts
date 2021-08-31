import client from 'prom-client';
import EventEmitter from 'events';
import { Knex } from 'knex';
import * as events from './metric-events';
import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    DB_POOL_UPDATE,
} from './types/events';
import { IUnleashConfig } from './types/option';
import { IUnleashStores } from './types/stores';
import Timer = NodeJS.Timer;

const TWO_HOURS = 2 * 60 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

export default class MetricsMonitor {
    timer?: Timer;

    poolMetricsTimer?: Timer;

    constructor() {
        this.timer = null;
        this.poolMetricsTimer = null;
    }

    startMonitoring(
        config: IUnleashConfig,
        stores: IUnleashStores,
        version: string,
        eventBus: EventEmitter,
        db: Knex,
    ): Promise<void> {
        if (!config.server.serverMetrics) {
            return;
        }

        const {
            eventStore,
            clientMetricsStore,
            featureToggleStore,
            userStore,
            projectStore,
        } = stores;

        client.collectDefaultMetrics();

        const requestDuration = new client.Summary({
            name: 'http_request_duration_milliseconds',
            help: 'App response time',
            labelNames: ['path', 'method', 'status'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
        });
        const dbDuration = new client.Summary({
            name: 'db_query_duration_seconds',
            help: 'DB query duration time',
            labelNames: ['store', 'action'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
        });
        const featureToggleUpdateTotal = new client.Counter({
            name: 'feature_toggle_update_total',
            help: 'Number of times a toggle has  been updated',
            labelNames: ['toggle'],
        });
        const featureToggleUsageTotal = new client.Counter({
            name: 'feature_toggle_usage_total',
            help: 'Number of times a feature toggle has been used',
            labelNames: ['toggle', 'active', 'appName'],
        });
        const featureTogglesTotal = new client.Gauge({
            name: 'feature_toggles_total',
            help: 'Number of feature toggles',
            labelNames: ['version'],
        });
        const usersTotal = new client.Gauge({
            name: 'users_total',
            help: 'Number of users',
        });
        const projectsTotal = new client.Gauge({
            name: 'projects_total',
            help: 'Number of projects',
        });

        async function collectStaticCounters() {
            let togglesCount: number = 0;
            let usersCount: number;
            let projectsCount: number;
            try {
                togglesCount = await featureToggleStore.count({
                    archived: false,
                });
                usersCount = await userStore.count();
                projectsCount = await projectStore.count();
                // eslint-disable-next-line no-empty
            } catch (e) {}

            featureTogglesTotal.reset();
            featureTogglesTotal.labels(version).set(togglesCount);
            if (usersCount) {
                usersTotal.reset();
                usersTotal.set(usersCount);
            }
            if (projectsCount) {
                projectsTotal.reset();
                projectsTotal.set(projectsCount);
            }
        }

        collectStaticCounters();
        this.timer = setInterval(
            () => collectStaticCounters(),
            TWO_HOURS,
        ).unref();

        eventBus.on(
            events.REQUEST_TIME,
            ({ path, method, time, statusCode }) => {
                requestDuration.labels(path, method, statusCode).observe(time);
            },
        );

        eventBus.on(events.DB_TIME, ({ store, action, time }) => {
            dbDuration.labels(store, action).observe(time);
        });

        eventStore.on(FEATURE_CREATED, ({ data }) => {
            featureToggleUpdateTotal.labels(data.name).inc();
        });
        eventStore.on(FEATURE_UPDATED, ({ data }) => {
            featureToggleUpdateTotal.labels(data.name).inc();
        });
        eventStore.on(FEATURE_ARCHIVED, ({ data }) => {
            featureToggleUpdateTotal.labels(data.name).inc();
        });
        eventStore.on(FEATURE_REVIVED, ({ data }) => {
            featureToggleUpdateTotal.labels(data.name).inc();
        });

        clientMetricsStore.on('metrics', (m) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const entry of Object.entries(m.bucket.toggles)) {
                featureToggleUsageTotal
                    .labels(entry[0], 'true', m.appName)
                    // @ts-ignore
                    .inc(entry[1].yes);
                featureToggleUsageTotal
                    .labels(entry[0], 'false', m.appName)
                    // @ts-ignore
                    .inc(entry[1].no);
            }
        });

        this.configureDbMetrics(db, eventBus);
    }

    stopMonitoring(): void {
        clearInterval(this.timer);
        clearInterval(this.poolMetricsTimer);
    }

    configureDbMetrics(db: Knex, eventBus: EventEmitter): void {
        if (db && db.client) {
            const dbPoolMin = new client.Gauge({
                name: 'db_pool_min',
                help: 'Minimum DB pool size',
            });
            dbPoolMin.set(db.client.pool.min);
            const dbPoolMax = new client.Gauge({
                name: 'db_pool_max',
                help: 'Maximum DB pool size',
            });
            dbPoolMax.set(db.client.pool.max);
            const dbPoolFree = new client.Gauge({
                name: 'db_pool_free',
                help: 'Current free connections in DB pool',
            });
            const dbPoolUsed = new client.Gauge({
                name: 'db_pool_used',
                help: 'Current connections in use in DB pool',
            });
            const dbPoolPendingCreates = new client.Gauge({
                name: 'db_pool_pending_creates',
                help: 'how many asynchronous create calls are running in DB pool',
            });
            const dbPoolPendingAcquires = new client.Gauge({
                name: 'db_pool_pending_acquires',
                help: 'how many acquires are waiting for a resource to be released in DB pool',
            });

            eventBus.on(DB_POOL_UPDATE, (data) => {
                dbPoolFree.set(data.free);
                dbPoolUsed.set(data.used);
                dbPoolPendingCreates.set(data.pendingCreates);
                dbPoolPendingAcquires.set(data.pendingAcquires);
            });

            this.registerPoolMetrics(db.client.pool, eventBus);
            this.poolMetricsTimer = setInterval(
                () => this.registerPoolMetrics(db.client.pool, eventBus),
                ONE_MINUTE,
            );
            this.poolMetricsTimer.unref();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    registerPoolMetrics(pool: any, eventBus: EventEmitter) {
        try {
            eventBus.emit(DB_POOL_UPDATE, {
                used: pool.numUsed(),
                free: pool.numFree(),
                pendingCreates: pool.numPendingCreates(),
                pendingAcquires: pool.numPendingAcquires(),
            });
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }
}
export function createMetricsMonitor(): MetricsMonitor {
    return new MetricsMonitor();
}

module.exports = {
    createMetricsMonitor,
};
