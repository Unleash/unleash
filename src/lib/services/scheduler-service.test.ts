import type { LogProvider } from '../logger.js';
import { SchedulerService } from '../features/scheduler/scheduler-service.js';
import { createTestConfig } from '../../test/config/test-config.js';
import FakeSettingStore from '../../test/fixtures/fake-setting-store.js';
import SettingService from './setting-service.js';
import type EventService from '../features/events/event-service.js';
import MaintenanceService from '../features/maintenance/maintenance-service.js';

import { vi } from 'vitest';

function ms(timeMs: number) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

const getLogger = () => {
    const records: any[] = [];
    const logger: LogProvider = () => ({
        error(...args: any[]) {
            records.push(args);
        },
        debug() {},
        info() {},
        warn() {},
        fatal() {},
    });
    const getRecords = () => {
        return records;
    };

    return { logger, getRecords };
};

let schedulerService: SchedulerService;
let getRecords: () => any[];

beforeEach(() => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const { logger, getRecords: getRecordsFn } = getLogger();
    getRecords = getRecordsFn;

    schedulerService = new SchedulerService(
        logger,
        maintenanceService,
        config.eventBus,
    );
});

test('Schedules job immediately', async () => {
    const job = vi.fn() as () => Promise<void> as () => Promise<void>;
    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toHaveBeenCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule a single regular job', async () => {
    const job = vi.fn() as () => Promise<void>;
    await schedulerService.schedule(job, 50, 'test-id-3');
    await ms(75);

    expect(job).toHaveBeenCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the same interval', async () => {
    const job = vi.fn() as () => Promise<void>;
    const anotherJob = vi.fn() as () => Promise<void>;

    await schedulerService.schedule(job, 50, 'test-id-6');
    await schedulerService.schedule(anotherJob, 50, 'test-id-7');
    await ms(75);

    expect(job).toHaveBeenCalledTimes(2);
    expect(anotherJob).toHaveBeenCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the different intervals', async () => {
    const job = vi.fn() as () => Promise<void>;
    const anotherJob = vi.fn() as () => Promise<void>;

    await schedulerService.schedule(job, 100, 'test-id-8');
    await schedulerService.schedule(anotherJob, 200, 'test-id-9');
    await ms(250);

    expect(job).toHaveBeenCalledTimes(3);
    expect(anotherJob).toHaveBeenCalledTimes(2);
    schedulerService.stop();
});

test('Can handle crash of a async job', async () => {
    const job = async () => {
        await Promise.reject('async reason');
    };

    await schedulerService.schedule(job, 50, 'test-id-10');
    await ms(75);

    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain(
        'initial scheduled job failed | id: test-id-10',
    );
    expect(records[1][0]).toContain(
        'interval scheduled job failed | id: test-id-10',
    );
});

test('Can handle crash of a sync job', async () => {
    const job = () => {
        throw new Error('sync reason');
    };

    await schedulerService.schedule(job, 50, 'test-id-11');
    await ms(75);

    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain(
        'initial scheduled job failed | id: test-id-11',
    );
    expect(records[1][0]).toContain(
        'interval scheduled job failed | id: test-id-11',
    );
});
