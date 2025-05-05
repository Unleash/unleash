import { SchedulerService } from '../scheduler/scheduler-service.js';
import MaintenanceService from './maintenance-service.js';
import SettingService from '../../services/setting-service.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store.js';
import type EventService from '../events/event-service.js';
import { TEST_AUDIT_USER } from '../../types/index.js';
import { jest } from '@jest/globals';

test('Scheduler should run scheduled functions if maintenance mode is off', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
        config.eventBus,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});

test('Scheduler should not run scheduled functions if maintenance mode is on', async () => {
    const config = createTestConfig();
    const settingStore = new FakeSettingStore();
    const settingService = new SettingService({ settingStore }, config, {
        storeEvent() {},
    } as unknown as EventService);
    const maintenanceService = new MaintenanceService(config, settingService);
    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
        config.eventBus,
    );

    await maintenanceService.toggleMaintenanceMode(
        { enabled: true },
        TEST_AUDIT_USER,
    );

    const job = jest.fn();

    await schedulerService.schedule(job, 10, 'test-id');

    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});
