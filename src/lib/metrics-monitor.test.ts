import EventEmitter from 'events';
import type { Knex } from 'knex';
import { register } from 'prom-client';
import { afterEach, expect, test, vi } from 'vitest';
import { createTestConfig } from '../test/config/test-config.js';
import createStores from '../test/fixtures/store.js';
import type { InstanceStatsService } from './features/instance-stats/instance-stats-service.js';
import MetricsMonitor from './metrics.js';
import type { SchedulerService } from './services/index.js';

afterEach(() => {
    register.clear();
});

test('scheduled pool metrics reflect the current pool state', async () => {
    const pool = {
        min: 0,
        max: 10,
        numUsed: () => 3,
        numFree: () => 7,
        numPendingCreates: () => 2,
        numPendingAcquires: () => 4,
    };
    const db = { client: { pool } } as unknown as Knex;
    const schedulerService = {
        schedule: vi.fn(
            async (scheduledFunction: () => Promise<unknown>, _time, id) => {
                if (id === 'registerPoolMetrics') {
                    await scheduledFunction();
                }
            },
        ),
    } as unknown as SchedulerService;

    await new MetricsMonitor().startMonitoring(
        createTestConfig({ server: { serverMetrics: true } }),
        createStores(),
        'test',
        new EventEmitter(),
        {} as InstanceStatsService,
        schedulerService,
        db,
    );

    await expect(
        register.getSingleMetricAsString('db_pool_used'),
    ).resolves.toContain('db_pool_used 3');
    await expect(
        register.getSingleMetricAsString('db_pool_free'),
    ).resolves.toContain('db_pool_free 7');
    await expect(
        register.getSingleMetricAsString('db_pool_pending_creates'),
    ).resolves.toContain('db_pool_pending_creates 2');
    await expect(
        register.getSingleMetricAsString('db_pool_pending_acquires'),
    ).resolves.toContain('db_pool_pending_acquires 4');
});
