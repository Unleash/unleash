import { SchedulerService } from './scheduler-service';
import { LogProvider } from '../../logger';
import MaintenanceService from '../../services/maintenance-service';
import { createTestConfig } from '../../../test/config/test-config';
import SettingService from '../../services/setting-service';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store';
import EventService from '../../services/event-service';

function ms(timeMs) {
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
    const getRecords = () => records;

    return { logger, getRecords };
};

test('Schedules job immediately', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Does not schedule job immediately when paused', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();

    schedulerService.pause();
    await schedulerService.schedule(job, 10, 'test-id-2');

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});

test('Can schedule a single regular job', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 50, 'test-id-3');
    await ms(75);

    expect(job).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Scheduled job ignored in a paused mode', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();

    schedulerService.pause();
    await schedulerService.schedule(job, 50, 'test-id-4');
    await ms(75);

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});

test('Can resume paused job', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();

    schedulerService.pause();
    await schedulerService.schedule(job, 50, 'test-id-5');
    schedulerService.resume();
    await ms(75);

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the same interval', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );

    const job = jest.fn();
    const anotherJob = jest.fn();

    await schedulerService.schedule(job, 50, 'test-id-6');
    await schedulerService.schedule(anotherJob, 50, 'test-id-7');
    await ms(75);

    expect(job).toBeCalledTimes(2);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can schedule multiple jobs at the different intervals', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
    );
    const job = jest.fn();
    const anotherJob = jest.fn();

    await schedulerService.schedule(job, 100, 'test-id-8');
    await schedulerService.schedule(anotherJob, 200, 'test-id-9');
    await ms(250);

    expect(job).toBeCalledTimes(3);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});

test('Can handle crash of a async job', async () => {
    const { logger, getRecords } = getLogger();
    const config = { ...createTestConfig(), logger };
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(logger, maintenanceService);

    const job = async () => {
        await Promise.reject('async reason');
    };

    await schedulerService.schedule(job, 50, 'test-id-10');
    await ms(75);

    schedulerService.stop();
    expect(getRecords()).toEqual([
        ['scheduled job failed | id: test-id-10 | async reason'],
        ['scheduled job failed | id: test-id-10 | async reason'],
    ]);
});

test('Can handle crash of a sync job', async () => {
    const { logger, getRecords } = getLogger();
    const config = { ...createTestConfig(), logger };
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(logger, maintenanceService);

    const job = () => {
        throw new Error('sync reason');
    };

    await schedulerService.schedule(job, 50, 'test-id-11');
    await ms(75);

    schedulerService.stop();
    expect(getRecords()).toEqual([
        ['scheduled job failed | id: test-id-11 | Error: sync reason'],
        ['scheduled job failed | id: test-id-11 | Error: sync reason'],
    ]);
});
